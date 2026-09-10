/**
 * 给页面上所有 .card 绑定点赞 / 稍后读 / 不感兴趣按钮，并根据本地书库同步按钮状态。
 * 通过事件委托实现，动态插入的卡片（搜索结果）也自动生效。
 */
import type { CardItem } from '../lib/types';
import { getItem, loadLibrary, onLibraryChange, removeItem, toggle } from './store';

function parseCard(el: HTMLElement): CardItem | null {
  try {
    return JSON.parse(el.dataset.item || '') as CardItem;
  } catch {
    return null;
  }
}

export function refreshCardStates(root: ParentNode = document): void {
  const map = new Map(loadLibrary().map((it) => [it.id, it]));
  root.querySelectorAll<HTMLElement>('.card[data-id]').forEach((card) => {
    const it = map.get(card.dataset.id || '');
    card.classList.toggle('is-liked', Boolean(it?.liked));
    card.classList.toggle('is-later', Boolean(it?.later));
    card.classList.toggle('is-disliked', Boolean(it?.disliked));
    card.querySelector('[data-action="liked"]')?.classList.toggle('active', Boolean(it?.liked));
    card.querySelector('[data-action="later"]')?.classList.toggle('active', Boolean(it?.later));
    card.querySelector('[data-action="disliked"]')?.classList.toggle('active', Boolean(it?.disliked));
  });
}

let bound = false;
export function bindCardActions(): void {
  if (bound) return;
  bound = true;
  document.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('button[data-action]');
    if (!btn) return;
    const card = btn.closest<HTMLElement>('.card[data-id]');
    if (!card) return;
    const action = btn.dataset.action;
    if (action === 'remove') {
      removeItem(card.dataset.id || '');
      return;
    }
    const item = parseCard(card);
    if (!item) return;
    if (action === 'liked' || action === 'later' || action === 'disliked') {
      toggle(item, action);
      refreshCardStates();
    }
  });
  onLibraryChange(() => refreshCardStates());
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith('ts:library')) refreshCardStates();
  });
  refreshCardStates();
}

export { getItem };
