/**
 * 给页面上所有 .card 绑定点赞 / 稍后读 / 不感兴趣按钮，并根据本地书库同步按钮状态。
 * 通过事件委托实现，动态插入的卡片（搜索结果）也自动生效。
 */
import type { CardItem } from '../lib/types';
import { detailPath } from '../lib/card';
import { getItem, loadLibrary, onLibraryChange, removeItem, toggle } from './store';

function parseCard(el: HTMLElement): CardItem | null {
  try {
    return JSON.parse(el.dataset.item || '') as CardItem;
  } catch {
    return null;
  }
}

let toastTimer: number | undefined;
export function toast(msg: string): void {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove('show'), 2200);
}

/** 分享：优先系统分享面板（手机），否则复制链接到剪贴板 */
export async function shareItem(item: CardItem): Promise<void> {
  const url = location.origin + detailPath(item);
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      await nav.share({ title: item.title, text: item.text.slice(0, 140), url });
      return;
    } catch {
      /* 用户取消，回退到复制 */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('链接已复制');
  } catch {
    window.prompt('复制这个链接：', url);
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
    if (action === 'share') {
      shareItem(item);
      return;
    }
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
