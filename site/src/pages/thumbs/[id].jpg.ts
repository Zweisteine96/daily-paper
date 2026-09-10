/**
 * 把仓库 data/thumbs/*.jpg（管道用 PDF 首页渲染的兜底缩略图）原样输出到站点 thumbs/<id>.jpg。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { APIContext } from 'astro';

const dir = fileURLToPath(new URL('../../../../data/thumbs/', import.meta.url));

export function getStaticPaths() {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => ({ params: { id: f.slice(0, -4) } }));
}

export function GET({ params }: APIContext) {
  const body = readFileSync(join(dir, `${params.id}.jpg`));
  return new Response(body, {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=604800' },
  });
}
