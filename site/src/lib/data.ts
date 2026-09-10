/** 构建时读取仓库根目录 data/ 下的 JSON 文件（服务端使用）。 */
import type { CardItem, DailyFile, Paper, Repo } from './types';

const paperFiles = import.meta.glob<DailyFile<Paper>>('../../../data/papers/*.json', {
  eager: true,
  import: 'default',
});
const repoFiles = import.meta.glob<DailyFile<Repo>>('../../../data/repos/*.json', {
  eager: true,
  import: 'default',
});

function byDateDesc<T extends { date: string }>(files: Record<string, T>): T[] {
  return Object.values(files).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const paperDays: DailyFile<Paper>[] = byDateDesc(paperFiles);
export const repoDays: DailyFile<Repo>[] = byDateDesc(repoFiles);

export const latestPapers = paperDays[0];
export const latestRepos = repoDays[0];

/** 所有出现过的日期（论文或项目任一有数据） */
export const allDates: string[] = Array.from(
  new Set([...paperDays.map((d) => d.date), ...repoDays.map((d) => d.date)]),
).sort((a, b) => (a < b ? 1 : -1));

export function papersOn(date: string): DailyFile<Paper> | undefined {
  return paperDays.find((d) => d.date === date);
}
export function reposOn(date: string): DailyFile<Repo> | undefined {
  return repoDays.find((d) => d.date === date);
}

export function paperToCard(p: Paper): CardItem {
  const authors = p.authors.slice(0, 6).join(', ') + (p.authors.length > 6 ? ' 等' : '');
  return {
    type: 'paper',
    id: p.id,
    title: p.title,
    url: p.url,
    subtitle: authors,
    text: p.abstract,
    tags: p.categories,
    date: p.published.slice(0, 10),
    score: p.score,
    why: p.why,
    keywords: p.matched_keywords,
    pdf: p.pdf_url,
  };
}

export function repoToCard(r: Repo): CardItem {
  return {
    type: 'repo',
    id: r.id,
    title: r.full_name,
    url: r.url,
    subtitle: r.language || '',
    text: r.description,
    tags: r.topics.slice(0, 10),
    date: r.created_at.slice(0, 10),
    score: r.score,
    why: r.why,
    keywords: r.matched_keywords,
    stars: r.stars,
    starsDelta: r.stars_delta,
    isNew: r.is_new,
  };
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
