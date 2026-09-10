"""打分：本地 embedding 相似度 + 关键词规则。全部在 CPU 上本地完成，不调用任何付费 API。"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

import numpy as np

from .config import CACHE_DIR, Config

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------


class Embedder:
    """fastembed 封装。模型下载失败或依赖缺失时退化为 None（只用关键词打分）。"""

    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None
        try:
            from fastembed import TextEmbedding

            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self._model = TextEmbedding(model_name=model_name, cache_dir=str(CACHE_DIR))
            log.info("已加载 embedding 模型 %s", model_name)
        except Exception as exc:  # noqa: BLE001
            log.warning("无法加载 embedding 模型 %s，将只使用关键词打分: %s", model_name, exc)

    @property
    def available(self) -> bool:
        return self._model is not None

    def encode(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, 384), dtype=np.float32)
        vecs = np.asarray(list(self._model.embed(texts, batch_size=32)), dtype=np.float32)
        norms = np.linalg.norm(vecs, axis=1, keepdims=True) + 1e-9
        return vecs / norms


# ---------------------------------------------------------------------------
# 兴趣画像
# ---------------------------------------------------------------------------


@dataclass
class Profile:
    positive_texts: list[str]  # 兴趣描述 + 点赞过的条目
    positive_labels: list[str]  # 用于解释「为什么推荐」
    negative_texts: list[str]  # 不感兴趣的条目
    positive_vecs: np.ndarray | None = None
    negative_vecs: np.ndarray | None = None


def build_profile(cfg: Config, library_items: list[dict], embedder: Embedder | None) -> Profile:
    pos_texts = list(cfg.interests)
    pos_labels = [f"兴趣：{s}" for s in cfg.interests]
    neg_texts: list[str] = []

    for item in library_items:
        text = _item_text(item)
        if not text:
            continue
        status = item.get("status")
        if status == "liked":
            pos_texts.append(text)
            pos_labels.append(f"你点赞过：{item.get('title', '')[:60]}")
        elif status == "later":
            # 稍后读是弱正样本，也算进来
            pos_texts.append(text)
            pos_labels.append(f"你收藏过：{item.get('title', '')[:60]}")
        elif status == "disliked":
            neg_texts.append(text)

    profile = Profile(pos_texts, pos_labels, neg_texts)
    if embedder is not None and embedder.available:
        profile.positive_vecs = embedder.encode(pos_texts) if pos_texts else None
        profile.negative_vecs = embedder.encode(neg_texts) if neg_texts else None
    log.info("兴趣画像：%d 个正样本，%d 个负样本", len(pos_texts), len(neg_texts))
    return profile


def _item_text(item: dict) -> str:
    parts = [item.get("title") or "", item.get("abstract") or item.get("description") or ""]
    return " ".join(p for p in parts if p).strip()


# ---------------------------------------------------------------------------
# 关键词
# ---------------------------------------------------------------------------


def _kw_pattern(kw: str) -> re.Pattern:
    return re.compile(r"(?<![A-Za-z0-9])" + re.escape(kw) + r"(?![A-Za-z0-9])", re.IGNORECASE)


class KeywordScorer:
    def __init__(self, boost: list[str], mute: list[str]):
        self.boost = [(k, _kw_pattern(k)) for k in boost]
        self.mute = [(k, _kw_pattern(k)) for k in mute]

    def score(self, title: str, body: str) -> tuple[float, list[str], list[str]]:
        """返回 (原始分, 命中的加分词, 命中的减分词)。标题命中算 2 分，正文命中算 1 分。"""
        raw = 0.0
        hits: list[str] = []
        muted: list[str] = []
        for kw, pat in self.boost:
            t = bool(pat.search(title))
            b = bool(pat.search(body))
            if t or b:
                hits.append(kw)
                raw += 2.0 if t else 1.0
        for kw, pat in self.mute:
            if pat.search(title) or pat.search(body):
                muted.append(kw)
                raw -= 3.0
        return raw, hits, muted


# ---------------------------------------------------------------------------
# 综合打分
# ---------------------------------------------------------------------------


def _normalize(x: np.ndarray) -> np.ndarray:
    if x.size == 0:
        return x
    lo, hi = float(np.min(x)), float(np.max(x))
    if hi - lo < 1e-9:
        return np.full_like(x, 0.5)
    return (x - lo) / (hi - lo)


def score_items(
    cfg: Config,
    items: list[dict],
    text_fn,
    title_fn,
    profile: Profile,
    embedder: Embedder | None,
    kw_scorer: KeywordScorer,
) -> list[dict]:
    """给一批条目打分并原地写入 score 相关字段，返回按分数排序的新列表。

    text_fn(item) -> 用于 embedding 的文本；title_fn(item) -> 标题。
    """
    if not items:
        return []

    n = len(items)
    emb_raw = np.zeros(n, dtype=np.float32)
    why_idx = np.full(n, -1, dtype=int)
    neg_raw = np.zeros(n, dtype=np.float32)

    use_emb = embedder is not None and embedder.available and profile.positive_vecs is not None
    if use_emb:
        vecs = embedder.encode([text_fn(it) for it in items])
        sims = vecs @ profile.positive_vecs.T  # (n, P)
        top = np.sort(sims, axis=1)[:, -3:]
        emb_raw = 0.5 * sims.max(axis=1) + 0.5 * top.mean(axis=1)
        why_idx = sims.argmax(axis=1)
        if profile.negative_vecs is not None and len(profile.negative_vecs):
            neg_raw = (vecs @ profile.negative_vecs.T).max(axis=1)

    kw_raw = np.zeros(n, dtype=np.float32)
    kw_hits: list[list[str]] = []
    kw_muted: list[list[str]] = []
    for i, it in enumerate(items):
        raw, hits, muted = kw_scorer.score(title_fn(it), text_fn(it))
        kw_raw[i] = raw
        kw_hits.append(hits)
        kw_muted.append(muted)

    emb_norm = _normalize(emb_raw) if use_emb else np.full(n, 0.5, dtype=np.float32)
    kw_norm = np.tanh(np.clip(kw_raw, -6, 8) / 4.0)  # 大致落在 [-0.9, 0.96]
    kw_norm = (kw_norm + 1) / 2  # 映射到 [0, 1]

    w_e = cfg.weight_embedding if use_emb else 0.0
    w_k = cfg.weight_keyword if use_emb else 1.0
    final = w_e * emb_norm + w_k * kw_norm
    # 与「不感兴趣」条目过于相似则扣分
    final = final - 0.4 * np.clip(neg_raw - 0.75, 0, None) / 0.25

    for i, it in enumerate(items):
        it["score"] = round(float(final[i]), 4)
        it["score_embedding"] = round(float(emb_raw[i]), 4) if use_emb else None
        it["score_keyword"] = round(float(kw_raw[i]), 2)
        it["matched_keywords"] = kw_hits[i]
        it["muted_keywords"] = kw_muted[i]
        it["why"] = profile.positive_labels[int(why_idx[i])] if use_emb and why_idx[i] >= 0 else ""

    return sorted(items, key=lambda d: d["score"], reverse=True)
