/**
 * 卡片 HTML 生成器。服务端（Card.astro）和客户端（搜索 / 书库 / 学者页）共用同一份模板，
 * 保证样式一致。客户端脚本 hydrate.ts 会根据 data-item 里的 JSON 绑定按钮。
 *
 * 布局是双栏：左侧文字，右侧配图 / 视频（没有就放一块柔和的占位色块），中间不画分隔线。
 */
import { withBase } from './base';
import type { CardItem } from './types';

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtStars(n?: number): string {
  if (n === undefined || n === null) return '';
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
}

/** 详情页（分享落地页）的站内路径 */
export function detailPath(item: Pick<CardItem, 'type' | 'id'>): string {
  return item.type === 'paper' ? withBase(`p/${item.id}/`) : withBase(`r/${item.id}/`);
}

export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function isDirectVideo(url?: string | null): boolean {
  return Boolean(url && /\.(mp4|webm|mov)(\?|$)/i.test(url));
}

/** 生成右栏媒体块 */
export function mediaHtml(item: CardItem, opts: { large?: boolean } = {}): string {
  const yt = youtubeId(item.video);
  const href = esc(detailPath(item));
  const alt = esc(item.title);

  if (yt) {
    const thumb = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
    return `<a class="media video" href="${esc(item.video!)}" target="_blank" rel="noopener" title="观看视频">
      <img src="${thumb}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" />
      <span class="play">▶</span></a>`;
  }
  if (isDirectVideo(item.video)) {
    const poster = item.image ? ` poster="${esc(item.image)}"` : '';
    return `<div class="media video"><video src="${esc(item.video!)}"${poster} controls muted loop playsinline preload="none"></video></div>`;
  }
  if (item.image) {
    return `<a class="media" href="${href}" title="查看详情">
      <img src="${esc(item.image)}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('broken')" />
      <span class="media-fallback">${esc(item.type === 'paper' ? item.tags?.[0] ?? 'arXiv' : item.subtitle || 'GitHub')}</span></a>`;
  }
  const label = item.type === 'paper' ? item.tags?.[0] ?? 'arXiv' : item.subtitle || 'GitHub';
  return `<a class="media placeholder" href="${href}" title="查看详情"><span>${esc(label)}</span></a>`;
}

export interface CardOptions {
  /** 显示排名序号 */
  rank?: number;
  /** 是否显示「移出书库」按钮（书库页用） */
  removable?: boolean;
  /** 是否默认展开摘要 */
  expanded?: boolean;
  /** 紧凑模式（学者页里一行一篇） */
  compact?: boolean;
}

export function cardHtml(item: CardItem, opts: CardOptions = {}): string {
  const isPaper = item.type === 'paper';
  const meta: string[] = [];
  if (opts.rank) meta.push(`<span class="rank">#${opts.rank}</span>`);
  if (item.date) meta.push(`<span class="date">${esc(item.date)}</span>`);
  if (!isPaper && item.stars !== undefined) {
    const delta = item.starsDelta ? ` <span class="delta">+${fmtStars(item.starsDelta)}</span>` : '';
    meta.push(`<span class="stars">★ ${fmtStars(item.stars)}${delta}</span>`);
  }
  if (!isPaper && item.isNew) meta.push(`<span class="badge new">新项目</span>`);
  for (const b of item.badges ?? []) meta.push(`<span class="badge track">${esc(b)}</span>`);
  if (item.score !== undefined) meta.push(`<span class="score" title="综合推荐分">${(item.score * 100).toFixed(0)}</span>`);

  const tags = (item.tags ?? [])
    .slice(0, 8)
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join('');
  const kws = (item.keywords ?? [])
    .slice(0, 6)
    .map((k) => `<span class="kw">${esc(k)}</span>`)
    .join('');

  const links: string[] = [`<a href="${esc(item.url)}" target="_blank" rel="noopener">${isPaper ? 'arXiv' : 'GitHub'}</a>`];
  if (isPaper && item.pdf) links.push(`<a href="${esc(item.pdf)}" target="_blank" rel="noopener">PDF</a>`);
  for (const l of item.links ?? []) links.push(`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`);
  links.push(`<a href="${esc(detailPath(item))}">详情</a>`);

  const payload = esc(JSON.stringify(item));
  const removeBtn = opts.removable
    ? `<button class="btn ghost" data-action="remove" title="移出书库">移出</button>`
    : '';

  return `
<article class="card ${isPaper ? 'paper' : 'repo'}${opts.compact ? ' compact' : ''}" data-id="${esc(item.id)}" data-type="${item.type}" data-item="${payload}">
  <div class="card-body">
    <div class="card-head">
      <div class="meta">${meta.join('')}</div>
      <div class="actions">
        <button class="btn like" data-action="liked" title="点赞：加入书库并作为推荐正样本">♥ 点赞</button>
        <button class="btn later" data-action="later" title="稍后读">⌚ 稍后读</button>
        <button class="btn dislike" data-action="disliked" title="不感兴趣：作为推荐负样本">✕</button>
        <button class="btn share" data-action="share" title="复制分享链接">⇪ 分享</button>
        ${removeBtn}
      </div>
    </div>
    <h3 class="title"><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a></h3>
    ${item.subtitle ? `<p class="subtitle">${esc(item.subtitle)}</p>` : ''}
    <details class="abstract"${opts.expanded ? ' open' : ''}>
      <summary>${esc(item.text.slice(0, 180))}${item.text.length > 180 ? '…' : ''}</summary>
      <p>${esc(item.text)}</p>
    </details>
    <div class="card-foot">
      <div class="tags">${tags}${kws}</div>
      <div class="links">${links.join('')}</div>
    </div>
    ${item.why ? `<p class="why">${esc(item.why)}</p>` : ''}
  </div>
  <div class="card-media">${mediaHtml(item)}</div>
</article>`;
}
