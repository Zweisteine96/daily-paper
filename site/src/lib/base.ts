/** 处理 GitHub Pages 子路径（base）。服务端和客户端都可用。 */
const raw = import.meta.env.BASE_URL || '/';
export const BASE = raw.endsWith('/') ? raw : raw + '/';

/** withBase('archive/2026-09-10') -> '/daily-paper/archive/2026-09-10' */
export function withBase(path: string): string {
  return BASE + path.replace(/^\/+/, '');
}

/** 媒体地址：绝对 URL 原样返回；相对地址（如管道生成的 thumbs/<id>.jpg）补上 base。 */
export function resolveMedia(url?: string | null): string | null {
  if (!url) return null;
  return /^(https?:)?\/\//i.test(url) || url.startsWith('data:') ? url : withBase(url);
}
