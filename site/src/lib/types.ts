/** 管道输出的论文条目（data/papers/YYYY-MM-DD.json 里的 items） */
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  primary_category: string;
  published: string;
  updated: string;
  url: string;
  pdf_url: string;
  comment?: string;
  score: number;
  score_embedding: number | null;
  score_keyword: number;
  matched_keywords: string[];
  muted_keywords: string[];
  why: string;
  rank: number;
}

/** 管道输出的 GitHub 项目条目 */
export interface Repo {
  id: string;
  name: string;
  full_name: string;
  description: string;
  url: string;
  homepage: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  created_at: string;
  pushed_at: string;
  license: string;
  stars_delta: number | null;
  first_seen: string;
  is_new: boolean;
  score: number;
  score_relevance?: number;
  matched_keywords: string[];
  why: string;
  rank: number;
}

export interface DailyFile<T> {
  date: string;
  generated_at: string;
  total_fetched?: number;
  total_new?: number;
  items: T[];
}

/**
 * 卡片通用形状。服务端 Card.astro 和客户端 renderCard() 都用它，
 * 个人书库里存的也是它（加上收藏状态）。
 */
export interface CardItem {
  type: 'paper' | 'repo';
  id: string;
  title: string;
  url: string;
  subtitle: string; // 作者 / 语言 + star
  text: string; // 摘要 / 描述
  tags: string[]; // arXiv 分类 / GitHub topics
  date: string; // 发布 / 创建日期
  score?: number;
  why?: string;
  keywords?: string[];
  pdf?: string;
  stars?: number;
  starsDelta?: number | null;
  isNew?: boolean;
}

export type LibraryStatus = 'liked' | 'later' | 'disliked' | 'removed';

export interface LibraryItem extends CardItem {
  liked: boolean;
  later: boolean;
  disliked: boolean;
  /** 供 Python 管道读取的单一状态 */
  status: LibraryStatus;
  added_at: string;
  updated_at: string;
}

export interface LibraryFile {
  updated: string;
  items: LibraryItem[];
}

/** data/search-index.json 中的压缩条目 */
export interface IndexItem {
  t: 'paper' | 'repo';
  id: string;
  title: string;
  authors: string;
  text: string;
  tags: string[];
  url: string;
  date: string;
  day: string;
  score: number;
  stars?: number;
}
