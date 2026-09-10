"""通过 GitHub REST 搜索 API 发现机器人 / AI 相关项目。

- 有 token（Actions 自带 GITHUB_TOKEN）时搜索接口每分钟 30 次，无 token 每分钟 10 次。
- 每天只跑一次，几十个查询绝对在免费额度内。
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone

import requests

log = logging.getLogger(__name__)

API_URL = "https://api.github.com/search/repositories"
USER_AGENT = "techstation-daily-paper/0.1"


@dataclass
class Repo:
    id: str  # full_name，如 owner/name
    name: str
    full_name: str
    description: str
    url: str
    homepage: str
    stars: int
    forks: int
    language: str
    topics: list[str]
    created_at: str
    pushed_at: str
    license: str = ""
    archived: bool = False

    def to_dict(self) -> dict:
        return asdict(self)


def _session() -> tuple[requests.Session, float]:
    s = requests.Session()
    s.headers["Accept"] = "application/vnd.github+json"
    s.headers["User-Agent"] = USER_AGENT
    s.headers["X-GitHub-Api-Version"] = "2022-11-28"
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        s.headers["Authorization"] = f"Bearer {token}"
        interval = 60 / 30 + 0.2
    else:
        log.warning("未设置 GITHUB_TOKEN，GitHub 搜索限速为每分钟 10 次，抓取会比较慢")
        interval = 60 / 10 + 0.5
    return s, interval


def _parse(item: dict) -> Repo:
    return Repo(
        id=item["full_name"],
        name=item["name"],
        full_name=item["full_name"],
        description=(item.get("description") or "").strip(),
        url=item["html_url"],
        homepage=(item.get("homepage") or "").strip(),
        stars=int(item.get("stargazers_count", 0)),
        forks=int(item.get("forks_count", 0)),
        language=item.get("language") or "",
        topics=list(item.get("topics") or []),
        created_at=item.get("created_at", ""),
        pushed_at=item.get("pushed_at", ""),
        license=((item.get("license") or {}).get("spdx_id") or ""),
        archived=bool(item.get("archived", False)),
    )


def _search(session: requests.Session, q: str, sort: str = "stars", per_page: int = 50) -> list[Repo]:
    params = {"q": q, "sort": sort, "order": "desc", "per_page": per_page}
    try:
        resp = session.get(API_URL, params=params, timeout=60)
        if resp.status_code == 403 and "rate limit" in resp.text.lower():
            reset = int(resp.headers.get("X-RateLimit-Reset", "0"))
            wait = max(5, reset - int(time.time()) + 1)
            log.warning("GitHub 触发限速，等待 %d 秒", wait)
            time.sleep(min(wait, 120))
            resp = session.get(API_URL, params=params, timeout=60)
        resp.raise_for_status()
    except requests.RequestException as exc:
        log.warning("GitHub 搜索失败 (%s): %s", q, exc)
        return []
    return [_parse(it) for it in resp.json().get("items", [])]


def fetch_repos(topics: list[str], queries: list[str], min_stars: int, days_back: int) -> list[Repo]:
    """对每个 topic 抓「近期创建」和「近期活跃」两组，对每个自由查询抓「近期活跃」一组。"""
    session, interval = _session()
    since = (datetime.now(timezone.utc) - timedelta(days=days_back)).date().isoformat()
    seen: dict[str, Repo] = {}
    searches: list[str] = []

    for topic in topics:
        searches.append(f"topic:{topic} created:>={since} stars:>={min_stars}")
        searches.append(f"topic:{topic} pushed:>={since} stars:>={min_stars * 4}")
    for q in queries:
        searches.append(f"{q} in:name,description,readme pushed:>={since} stars:>={min_stars}")

    for i, q in enumerate(searches):
        if i > 0:
            time.sleep(interval)
        for repo in _search(session, q):
            if repo.archived:
                continue
            seen.setdefault(repo.id, repo)
        log.info("GitHub 查询 %d/%d 完成，累计 %d 个项目", i + 1, len(searches), len(seen))

    return list(seen.values())
