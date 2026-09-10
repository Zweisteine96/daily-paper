"""从 arXiv 官方 API 抓取最近提交的论文。

API 文档：https://info.arxiv.org/help/api/user-manual.html
要求：请求间隔 >= 3 秒，单次 max_results 不宜过大。
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone

import feedparser
import requests

log = logging.getLogger(__name__)

API_URL = "https://export.arxiv.org/api/query"
PAGE_SIZE = 200
REQUEST_INTERVAL = 3.0
USER_AGENT = "techstation-daily-paper/0.1 (personal research feed)"

_VERSION_RE = re.compile(r"v\d+$")


@dataclass
class Paper:
    id: str  # 例如 2409.01234（不带版本号）
    title: str
    authors: list[str]
    abstract: str
    categories: list[str]
    primary_category: str
    published: str  # ISO 8601
    updated: str
    url: str
    pdf_url: str
    comment: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


def _strip_version(arxiv_id: str) -> str:
    return _VERSION_RE.sub("", arxiv_id)


_LATEX_CMD_RE = re.compile(r"\\(?:textbf|textit|texttt|emph|textsc|underline|mathrm|mathbf|text)\{([^{}]*)\}")


def _clean(text: str) -> str:
    """压缩空白并去掉摘要里常见的 LaTeX 排版命令（\\textbf{X} -> X）。"""
    text = text or ""
    for _ in range(2):  # 处理一层嵌套
        text = _LATEX_CMD_RE.sub(r"\1", text)
    text = text.replace("\\%", "%").replace("\\&", "&").replace("\\_", "_")
    return re.sub(r"\s+", " ", text).strip()


def _parse_entry(entry) -> Paper | None:
    try:
        raw_id = entry.id.rsplit("/abs/", 1)[-1]
        pid = _strip_version(raw_id)
        tags = [t["term"] for t in entry.get("tags", []) if "term" in t]
        primary = entry.get("arxiv_primary_category", {}).get("term") or (tags[0] if tags else "")
        pdf_url = ""
        for link in entry.get("links", []):
            if link.get("title") == "pdf" or link.get("type") == "application/pdf":
                pdf_url = link.get("href", "")
        return Paper(
            id=pid,
            title=_clean(entry.title),
            authors=[_clean(a.get("name", "")) for a in entry.get("authors", [])],
            abstract=_clean(entry.summary),
            categories=tags,
            primary_category=primary,
            published=entry.published,
            updated=entry.updated,
            url=f"https://arxiv.org/abs/{pid}",
            pdf_url=pdf_url or f"https://arxiv.org/pdf/{pid}",
            comment=_clean(entry.get("arxiv_comment", "")),
        )
    except Exception as exc:  # noqa: BLE001
        log.warning("解析 arXiv 条目失败: %s", exc)
        return None


def fetch_category(category: str, cutoff: datetime, max_results: int) -> list[Paper]:
    """按提交时间倒序拉取某个分类，直到早于 cutoff 或达到 max_results。"""
    return fetch_query(f"cat:{category}", cutoff, max_results, label=category)


def fetch_by_author(name: str, cutoff: datetime, max_results: int = 50) -> list[Paper]:
    """按作者名查最近的论文，并用作者列表精确匹配过滤掉同名误报。"""
    papers = fetch_query(f'au:"{name}"', cutoff, max_results, label=f"au:{name}")
    target = _norm_name(name)
    return [p for p in papers if any(_norm_name(a) == target for a in p.authors)]


def fetch_by_authors(names: list[str], cutoff: datetime, max_per_author: int = 30) -> dict[str, list[Paper]]:
    """一次请求查多位作者（au:"A" OR au:"B" …），再按精确姓名把论文分派给各自作者。

    arXiv 要求请求间隔 3 秒，逐人查询 50 位学者要 3~5 分钟；合并后请求数减少约 8 倍。
    """
    if not names:
        return {}
    query = " OR ".join(f'au:"{n}"' for n in names)
    # 一组里每个人最多 max_per_author 篇，但单次请求不超过一页
    max_results = min(PAGE_SIZE, max_per_author * len(names))
    papers = fetch_query(query, cutoff, max_results, label=f"au×{len(names)}")
    targets = {_norm_name(n): n for n in names}
    out: dict[str, list[Paper]] = {n: [] for n in names}
    for p in papers:
        for a in p.authors:
            name = targets.get(_norm_name(a))
            if name is not None and p not in out[name]:
                out[name].append(p)
    return out


def _norm_name(name: str) -> str:
    return re.sub(r"[^a-z ]", "", name.lower()).strip()


def fetch_query(search_query: str, cutoff: datetime, max_results: int, label: str = "") -> list[Paper]:
    papers: list[Paper] = []
    start = 0
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    while start < max_results:
        params = {
            "search_query": search_query,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
            "start": start,
            "max_results": min(PAGE_SIZE, max_results - start),
        }
        try:
            resp = session.get(API_URL, params=params, timeout=60)
            resp.raise_for_status()
        except requests.RequestException as exc:
            log.warning("arXiv 请求失败 (%s start=%d): %s", label or search_query, start, exc)
            break

        feed = feedparser.parse(resp.text)
        entries = feed.entries
        if not entries:
            break

        reached_cutoff = False
        for entry in entries:
            paper = _parse_entry(entry)
            if paper is None:
                continue
            published = datetime.fromisoformat(paper.published.replace("Z", "+00:00"))
            if published < cutoff:
                reached_cutoff = True
                break
            papers.append(paper)

        if reached_cutoff or len(entries) < params["max_results"]:
            break
        start += len(entries)
        time.sleep(REQUEST_INTERVAL)

    log.info("arXiv %s: 抓到 %d 篇（cutoff=%s）", label or search_query, len(papers), cutoff.date())
    return papers


def fetch_recent(categories: list[str], days_back: int, max_results: int) -> list[Paper]:
    """抓取多个分类并按 id 去重。"""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)
    seen: dict[str, Paper] = {}
    for i, cat in enumerate(categories):
        if i > 0:
            time.sleep(REQUEST_INTERVAL)
        for paper in fetch_category(cat, cutoff, max_results):
            if paper.id not in seen:
                seen[paper.id] = paper
    log.info("arXiv 合计去重后 %d 篇", len(seen))
    return list(seen.values())
