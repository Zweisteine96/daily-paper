"""为论文和项目找一张配图（只存 URL，不下载文件，仓库不膨胀）。

- 论文：arXiv 的 HTML 版本（https://arxiv.org/html/<id>）里的第一张正文图。
  2023 年底之后提交的论文大多有 HTML 版；没有的返回 None，前端显示占位图。
- 项目：README 里的第一张非徽章图片（GIF / webp 演示图优先级最高），
  没有就退回 GitHub 官方的 OpenGraph 预览图（对任何公开仓库都可用）。
"""

from __future__ import annotations

import base64
import logging
import os
import re
import time
from html import unescape
from urllib.parse import urljoin, urlparse

import requests

log = logging.getLogger(__name__)

USER_AGENT = "techstation-daily-paper/0.1 (personal research feed)"
ARXIV_HTML_INTERVAL = 1.0  # 对 arxiv.org 保持礼貌

_FIGURE_RE = re.compile(r"<figure\b[^>]*class=\"[^\"]*ltx_figure[^\"]*\"[^>]*>(.*?)</figure>", re.S | re.I)
_IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
_ATTR_RE = re.compile(r"([a-zA-Z_:-]+)\s*=\s*\"([^\"]*)\"")
_CAPTION_RE = re.compile(r"<figcaption\b[^>]*>(.*?)</figcaption>", re.S | re.I)
_TAG_RE = re.compile(r"<[^>]+>")
_YOUTUBE_RE = re.compile(r"(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})")
_URL_RE = re.compile(r"https?://[^\s<>\"')\]]+")


def _attrs(tag: str) -> dict[str, str]:
    return {k.lower(): unescape(v) for k, v in _ATTR_RE.findall(tag)}


def _strip_tags(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(_TAG_RE.sub(" ", html))).strip()


def _is_bad_image(src: str) -> bool:
    s = src.lower()
    return not s or "logo" in s or s.endswith(".svg") or "badge" in s


# ---------------------------------------------------------------------------
# arXiv 论文配图
# ---------------------------------------------------------------------------


def fetch_arxiv_figure(session: requests.Session, arxiv_id: str) -> dict | None:
    """返回 {"url": 图片绝对地址, "caption": 图注} 或 None。"""
    url = f"https://arxiv.org/html/{arxiv_id}"
    try:
        resp = session.get(url, timeout=30, stream=True)
        if resp.status_code != 200:
            return None
        # 最多读 2MB，足够覆盖前几张图
        chunks, total = [], 0
        for chunk in resp.iter_content(chunk_size=65536):
            chunks.append(chunk)
            total += len(chunk)
            if total > 2_000_000:
                break
        resp.close()
        html = b"".join(chunks).decode("utf-8", errors="ignore")
    except requests.RequestException as exc:
        log.debug("arXiv HTML 获取失败 %s: %s", arxiv_id, exc)
        return None

    candidates: list[tuple[int, str, str]] = []  # (优先级, src, caption)

    # 先看正式的 figure 块（有图注）
    for fig_html in _FIGURE_RE.findall(html):
        for img_tag in _IMG_RE.findall(fig_html):
            a = _attrs(img_tag)
            src = a.get("src", "")
            if _is_bad_image(src) or "ltx_missing" in a.get("class", ""):
                continue
            width = int(a.get("width", "0") or 0)
            cap_match = _CAPTION_RE.search(fig_html)
            caption = _strip_tags(cap_match.group(1)) if cap_match else ""
            prio = 0 if width >= 250 else 1
            candidates.append((prio, src, caption[:300]))
            break
        if candidates and candidates[-1][0] == 0:
            break

    # 再看散落的 ltx_graphics 图（teaser 图常常不在 figure 里）
    if not candidates or candidates[0][0] > 0:
        for img_tag in _IMG_RE.findall(html):
            a = _attrs(img_tag)
            if "ltx_graphics" not in a.get("class", "") or "ltx_missing" in a.get("class", ""):
                continue
            src = a.get("src", "")
            if _is_bad_image(src):
                continue
            width = int(a.get("width", "0") or 0)
            if width >= 250:
                candidates.insert(0, (0, src, ""))
                break

    if not candidates:
        return None
    candidates.sort(key=lambda c: c[0])
    _, src, caption = candidates[0]
    # 页面里的 src 形如 "2609.06251v1/fig.png"，相对于 https://arxiv.org/html/
    return {"url": urljoin("https://arxiv.org/html/", src), "caption": caption}


def find_video_url(*texts: str) -> str | None:
    """从摘要 / 评论里找 YouTube 链接。"""
    for t in texts:
        m = _YOUTUBE_RE.search(t or "")
        if m:
            return f"https://www.youtube.com/watch?v={m.group(1)}"
    return None


def find_project_links(*texts: str) -> dict[str, str]:
    """从摘要 / 评论里提取项目主页和代码链接。"""
    links: dict[str, str] = {}
    for t in texts:
        for url in _URL_RE.findall(t or ""):
            url = url.rstrip(".,;")
            host = urlparse(url).netloc.lower()
            if "github.com" in host and "code" not in links:
                links["code"] = url
            elif "arxiv.org" in host or "youtube" in host or "youtu.be" in host:
                continue
            elif "project" not in links:
                links["project"] = url
    return links


def enrich_papers(papers: list[dict]) -> None:
    """原地给论文加上 figure / video / links 字段。"""
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT
    hits = 0
    for i, p in enumerate(papers):
        if i > 0:
            time.sleep(ARXIV_HTML_INTERVAL)
        fig = fetch_arxiv_figure(session, p["id"])
        p["figure_url"] = fig["url"] if fig else None
        p["figure_caption"] = fig["caption"] if fig else ""
        p["video_url"] = find_video_url(p.get("abstract", ""), p.get("comment", ""))
        p["links"] = find_project_links(p.get("abstract", ""), p.get("comment", ""))
        hits += bool(fig)
    log.info("论文配图：%d/%d 篇找到图片", hits, len(papers))


# ---------------------------------------------------------------------------
# GitHub 项目配图
# ---------------------------------------------------------------------------

_MD_IMG_RE = re.compile(r"!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
_HTML_IMG_RE = re.compile(r"<img\b[^>]*?src=\"([^\"]+)\"", re.I)
_HTML_VIDEO_RE = re.compile(r"<video\b[^>]*?src=\"([^\"]+)\"", re.I)
_BARE_VIDEO_RE = re.compile(r"https://(?:github\.com/user-attachments/assets/[A-Za-z0-9-]+|user-images\.githubusercontent\.com/[^\s)\"']+\.(?:mp4|mov|webm))")
_BADGE_HOSTS = ("shields.io", "badge", "travis-ci", "circleci", "codecov", "colab.research.google.com/assets", "opencollective", "pepy.tech", "badgen")


def og_image(full_name: str) -> str:
    return f"https://opengraph.githubassets.com/1/{full_name}"


def _to_raw(url: str) -> str:
    """github.com/o/r/blob/branch/path -> raw.githubusercontent.com/o/r/branch/path"""
    m = re.match(r"https://github\.com/([^/]+)/([^/]+)/(?:blob|raw)/(.+)", url)
    if m:
        return f"https://raw.githubusercontent.com/{m.group(1)}/{m.group(2)}/{m.group(3)}"
    return url


def pick_readme_media(readme_md: str, base_raw_url: str) -> tuple[str | None, str | None]:
    """返回 (image_url, video_url)。GIF / webp 动图优先，其次普通图。"""
    video = None
    m = _HTML_VIDEO_RE.search(readme_md) or _BARE_VIDEO_RE.search(readme_md)
    if m:
        video = m.group(1) if m.re is _HTML_VIDEO_RE else m.group(0)

    images: list[str] = []
    for pat in (_MD_IMG_RE, _HTML_IMG_RE):
        for src in pat.findall(readme_md):
            src = src.strip()
            low = src.lower()
            if any(b in low for b in _BADGE_HOSTS) or low.endswith(".svg"):
                continue
            if "github.com/user-attachments/assets" in low and not re.search(r"\.(png|jpe?g|gif|webp)$", low):
                # user-attachments 里无扩展名的多半是视频
                video = video or src
                continue
            images.append(urljoin(base_raw_url, _to_raw(src)))
    if not images:
        return None, video
    animated = [u for u in images if re.search(r"\.(gif|webp)(\?|$)", u.lower())]
    return (animated[0] if animated else images[0]), video


def enrich_repos(repos: list[dict]) -> None:
    """原地给项目加上 image_url / video_url 字段。每个项目 1 次 API 调用。"""
    session = requests.Session()
    session.headers["Accept"] = "application/vnd.github+json"
    session.headers["User-Agent"] = USER_AGENT
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        session.headers["Authorization"] = f"Bearer {token}"
    hits = 0
    for r in repos:
        r["og_image"] = og_image(r["full_name"])
        r["image_url"] = None
        r["video_url"] = None
        try:
            resp = session.get(f"https://api.github.com/repos/{r['full_name']}/readme", timeout=30)
            if resp.status_code != 200:
                continue
            j = resp.json()
            md = base64.b64decode(j.get("content", "")).decode("utf-8", errors="ignore")
            base_raw = j.get("download_url") or f"https://raw.githubusercontent.com/{r['full_name']}/HEAD/README.md"
            img, vid = pick_readme_media(md, base_raw)
            r["image_url"], r["video_url"] = img, vid
            hits += bool(img)
        except (requests.RequestException, ValueError) as exc:
            log.debug("README 获取失败 %s: %s", r["full_name"], exc)
        if not token:
            time.sleep(1.0)
    log.info("项目配图：%d/%d 个从 README 找到图片，其余用 OpenGraph 预览图", hits, len(repos))
