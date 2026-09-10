/**
 * 「刷新推荐」：静态站点自己不能跑抓取，所以通过 GitHub API 触发 daily.yml 的 workflow_dispatch，
 * 然后轮询运行状态。跑完（约 5~10 分钟）后 Pages 会自动更新，刷新页面即可看到新内容。
 *
 * 需要 token 具备 Actions: Read and write 权限（在设置页说明）。
 */
import { loadSyncSettings } from './store';

const WORKFLOW_FILE = 'daily.yml';

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export interface RunInfo {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

export async function triggerRefresh(): Promise<void> {
  const s = loadSyncSettings();
  if (!s.token || !s.repo) throw new Error('请先在「设置」里配置仓库和 token（需要 Actions 写权限）');
  const res = await fetch(`https://api.github.com/repos/${s.repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
    method: 'POST',
    headers: headers(s.token),
    body: JSON.stringify({ ref: s.branch || 'main', inputs: { run_pipeline: 'true' } }),
  });
  if (res.status === 204) return;
  if (res.status === 403 || res.status === 404) {
    throw new Error(`GitHub 拒绝（${res.status}）：token 需要 Actions: Read and write 权限，且仓库名要正确`);
  }
  throw new Error(`触发失败 ${res.status}: ${await res.text()}`);
}

export async function latestRun(): Promise<RunInfo | null> {
  const s = loadSyncSettings();
  const url = `https://api.github.com/repos/${s.repo}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`;
  const res = await fetch(url, { headers: headers(s.token) });
  if (!res.ok) return null;
  const j = (await res.json()) as { workflow_runs: RunInfo[] };
  return j.workflow_runs?.[0] ?? null;
}

/** 轮询直到运行结束；每次状态变化调用 onUpdate */
export async function waitForRun(startedAfter: number, onUpdate: (r: RunInfo | null, elapsedSec: number) => void): Promise<RunInfo | null> {
  const t0 = Date.now();
  // 触发后 run 需要几秒才会出现在列表里
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 4000 : 12000));
    const run = await latestRun();
    const fresh = run && new Date(run.created_at).getTime() >= startedAfter - 60_000;
    onUpdate(fresh ? run : null, Math.round((Date.now() - t0) / 1000));
    if (fresh && run!.status === 'completed') return run;
  }
  return null;
}
