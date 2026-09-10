/** 处理 GitHub Pages 子路径（base）。服务端和客户端都可用。 */
const raw = import.meta.env.BASE_URL || '/';
export const BASE = raw.endsWith('/') ? raw : raw + '/';

/** withBase('archive/2026-09-10') -> '/daily-paper/archive/2026-09-10' */
export function withBase(path: string): string {
  return BASE + path.replace(/^\/+/, '');
}
