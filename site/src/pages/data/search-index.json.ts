/** 构建时把仓库 data/search-index.json 原样输出到站点，供搜索页在浏览器里加载。 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function GET() {
  const path = fileURLToPath(new URL('../../../../data/search-index.json', import.meta.url));
  let body = '{"updated":null,"items":[]}';
  try {
    body = await readFile(path, 'utf-8');
  } catch {
    /* 尚无索引 */
  }
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
