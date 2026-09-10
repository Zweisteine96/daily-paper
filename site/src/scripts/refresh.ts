/**
 * 「刷新推荐」：静态站点自己不能跑抓取，所以通过 GitHub API 触发 daily.yml 的 workflow_dispatch，
 * 然后轮询运行状态。按钮触发的是快速模式（跳过学者追踪，约 4 分钟）；跑完后 Pages 会自动更新，刷新页面即可看到新内容。
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

/** 快速模式（跳过学者追踪）大约需要的分钟数，用于界面提示 */
export const QUICK_ETA_MIN = 4;

export async function triggerRefresh(quick = true): Promise<void> {
  const s = loadSyncSettings();
  if (!s.token || !s.repo) throw new Error('请先在「设置」里配置仓库和 token（需要 Actions 写权限）');
  const res = await fetch(`https://api.github.com/repos/${s.repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
    method: 'POST',
    headers: headers(s.token),
    body: JSON.stringify({ ref: s.branch || 'main', inputs: { run_pipeline: 'true', quick: quick ? 'true' : 'false' } }),
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

/** 是否已有排队 / 进行中的运行（避免重复触发，一次点击排一个完整任务） */
export async function activeRun(): Promise<RunInfo | null> {
  const s = loadSyncSettings();
  if (!s.token || !s.repo) return null;
  const url = `https://api.github.com/repos/${s.repo}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=3`;
  const res = await fetch(url, { headers: headers(s.token) });
  if (!res.ok) return null;
  const j = (await res.json()) as { workflow_runs: RunInfo[] };
  return j.workflow_runs?.find((r) => r.status !== 'completed') ?? null;
}

async function runById(id: number): Promise<RunInfo | null> {
  const s = loadSyncSettings();
  const res = await fetch(`https://api.github.com/repos/${s.repo}/actions/runs/${id}`, { headers: headers(s.token) });
  return res.ok ? ((await res.json()) as RunInfo) : null;
}

/** 轮询直到运行结束；每次状态变化调用 onUpdate。可传入已知的 run（接管进行中的任务）。 */
export async function waitForRun(
  startedAfter: number,
  onUpdate: (r: RunInfo | null, elapsedSec: number) => void,
  known?: RunInfo | null,
): Promise<RunInfo | null> {
  const t0 = known ? new Date(known.created_at).getTime() : Date.now();
  let run: RunInfo | null = known ?? null;
  // 触发后 run 需要几秒才会出现在列表里
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, i === 0 && !known ? 4000 : 12000));
    if (run) {
      run = (await runById(run.id)) ?? run;
    } else {
      const latest = await latestRun();
      if (latest && new Date(latest.created_at).getTime() >= startedAfter - 60_000) run = latest;
    }
    onUpdate(run, Math.round((Date.now() - t0) / 1000));
    if (run && run.status === 'completed') return run;
  }
  return null;
}
