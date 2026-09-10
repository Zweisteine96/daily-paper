"""学者追踪：按 profile/labs.yaml 里的作者名查 arXiv，生成 data/labs.json。"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import yaml

from . import arxiv, media, store
from .arxiv import _norm_name
from .config import DATA_DIR, REPO_ROOT

log = logging.getLogger(__name__)

LABS_PROFILE_PATH = REPO_ROOT / "profile" / "labs.yaml"
LABS_DATA_PATH = DATA_DIR / "labs.json"


def _slugify(s: str) -> str:
    """生成 URL 友好的 slug（只保留 ASCII 字母数字；中文名请在 labs.yaml 里显式写 slug）。"""
    import re

    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def load_labs_profile(path: Path = LABS_PROFILE_PATH) -> dict:
    if not path.exists():
        return {"labs": [], "days_back": 45, "max_per_author": 30, "boost": 0.0}
    with open(path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}
    raw.setdefault("labs", [])
    raw.setdefault("days_back", 45)
    raw.setdefault("max_per_author", 30)
    raw.setdefault("boost", 0.06)
    raw.setdefault("categories", ["cs.RO", "cs.AI", "cs.LG", "cs.CV", "cs.CL", "cs.HC", "cs.MA", "eess.SY"])
    return raw


def tracked_names(profile: dict) -> dict[str, str]:
    """归一化姓名 -> 展示名"""
    out: dict[str, str] = {}
    for lab in profile["labs"]:
        for name in lab.get("researchers", []):
            out.setdefault(_norm_name(str(name)), str(name))
    return out


def tag_tracked_authors(papers: list[dict], profile: dict) -> int:
    """给每日推荐的论文加 tracked_authors 字段，返回命中数。"""
    names = tracked_names(profile)
    hits = 0
    for p in papers:
        matched = []
        for a in p.get("authors", []):
            disp = names.get(_norm_name(a))
            if disp and disp not in matched:
                matched.append(disp)
        p["tracked_authors"] = matched
        hits += bool(matched)
    return hits


def _compact(p: arxiv.Paper) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "authors": p.authors,
        "abstract": p.abstract,
        "categories": p.categories,
        "published": p.published,
        "url": p.url,
        "pdf_url": p.pdf_url,
        "comment": p.comment,
    }


def _previous_media() -> dict[str, dict]:
    """上一次 labs.json 里已经抓过的配图，按 id 复用，避免每天重复请求 arxiv.org。"""
    old = store.read_json(LABS_DATA_PATH, {})
    out: dict[str, dict] = {}
    for lab in old.get("labs", []):
        for r in lab.get("researchers", []):
            for p in r.get("papers", []):
                if p.get("figure_url"):
                    out[p["id"]] = {k: p.get(k) for k in ("figure_url", "figure_caption", "figure_source", "video_url", "links")}
    return out


AUTHORS_PER_QUERY = 8  # 每次 arXiv 请求合并查询的学者数（8 人 × 30 篇 < 单页 200 条）


def run_labs(profile: dict, day: str, fetch_media: bool = True) -> Path:
    """按组合并查询学者（每次请求间隔 3 秒），写 data/labs.json。"""
    cutoff = datetime.now(timezone.utc) - timedelta(days=int(profile["days_back"]))
    max_per = int(profile["max_per_author"])
    allowed = set(profile.get("categories") or [])
    prev_media = _previous_media()  # 即使不抓新图，也沿用上次的配图，避免 --skip-media 把图清空

    # 同一个人可能出现在多个实验室，只查一次；多人合并成一次请求
    cache: dict[str, list[dict]] = {}
    unique = sorted({str(n) for lab in profile["labs"] for n in lab.get("researchers", [])})
    per_query = max(1, min(AUTHORS_PER_QUERY, arxiv.PAGE_SIZE // max(max_per, 1)))
    groups = [unique[i : i + per_query] for i in range(0, len(unique), per_query)]
    log.info("学者追踪：%d 位学者，窗口 %d 天，分 %d 次请求", len(unique), int(profile["days_back"]), len(groups))
    for i, group in enumerate(groups):
        if i > 0:
            time.sleep(arxiv.REQUEST_INTERVAL)
        by_author = arxiv.fetch_by_authors(group, cutoff, max_per_author=max_per)
        for name, papers in by_author.items():
            if allowed:
                # 同名学者过滤：只保留和我们关心的领域相关的分类（比如把天体物理的 Yang Gao 去掉）
                papers = [p for p in papers if allowed & set(p.categories)]
            papers.sort(key=lambda p: p.published, reverse=True)
            cache[name] = [_compact(p) for p in papers[:max_per]]

    # 同一篇论文可能出现在多位学者名下，按 id 去重后只抓一次
    by_id: dict[str, dict] = {}
    for ps in cache.values():
        for p in ps:
            by_id.setdefault(p["id"], p)
    todo = []
    for pid, p in by_id.items():
        if pid in prev_media:
            p.update(prev_media[pid])
        else:
            todo.append(p)
    if fetch_media:
        media.enrich_papers(todo)
    for ps in cache.values():
        for p in ps:
            src = by_id[p["id"]]
            for k in ("figure_url", "figure_caption", "figure_source", "video_url", "links"):
                p[k] = src.get(k)

    labs_out = []
    for lab in profile["labs"]:
        researchers = []
        for name in lab.get("researchers", []):
            researchers.append({"name": str(name), "papers": cache.get(str(name), [])})
        labs_out.append(
            {
                "name": lab.get("name", ""),
                "short": lab.get("short", lab.get("name", "")),
                "slug": lab.get("slug") or _slugify(lab.get("short", lab.get("name", ""))) or f"lab-{len(labs_out) + 1}",
                "researchers": researchers,
                "total": sum(len(r["papers"]) for r in researchers),
            }
        )

    total_papers = len({p["id"] for ps in cache.values() for p in ps})
    store.write_json(
        LABS_DATA_PATH,
        {"updated": store.now_iso(), "day": day, "days_back": int(profile["days_back"]), "total": total_papers, "labs": labs_out},
    )
    log.info("学者追踪：共 %d 篇论文", total_papers)
    return LABS_DATA_PATH
