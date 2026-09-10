/**
 * 卡片 HTML 生成器。服务端（Card.astro）和客户端（搜索 / 书库页）共用同一份模板，
 * 保证样式一致。客户端脚本 hydrate.ts 会根据 data-item 里的 JSON 绑定按钮。
 */
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

export interface CardOptions {
  /** 显示排名序号 */
  rank?: number;
  /** 是否显示「移出书库」按钮（书库页用） */
  removable?: boolean;
  /** 是否默认展开摘要 */
  expanded?: boolean;
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
  if (isPaper) {
    links.push(
      `<a href="https://www.semanticscholar.org/arxiv/${esc(item.id)}" target="_blank" rel="noopener">S2</a>`,
    );
  }

  const payload = esc(JSON.stringify(item));
  const removeBtn = opts.removable
    ? `<button class="btn ghost" data-action="remove" title="移出书库">移出</button>`
    : '';

  return `
<article class="card ${isPaper ? 'paper' : 'repo'}" data-id="${esc(item.id)}" data-type="${item.type}" data-item="${payload}">
  <div class="card-head">
    <div class="meta">${meta.join('')}</div>
    <div class="actions">
      <button class="btn like" data-action="liked" title="点赞：加入书库并作为推荐正样本">♥ 点赞</button>
      <button class="btn later" data-action="later" title="稍后读">⌚ 稍后读</button>
      <button class="btn dislike" data-action="disliked" title="不感兴趣：作为推荐负样本">✕</button>
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
</article>`;
}
