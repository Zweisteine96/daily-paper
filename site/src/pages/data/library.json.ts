/** 构建时打包的书库快照（只读回退；开启 GitHub 同步后以 API 为准）。 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function GET() {
  const path = fileURLToPath(new URL('../../../../data/library.json', import.meta.url));
  let body = '{"updated":null,"items":[]}';
  try {
    body = await readFile(path, 'utf-8');
  } catch {
    /* 尚无书库 */
  }
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
