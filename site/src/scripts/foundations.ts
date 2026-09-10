/** 理论基础页的学习进度：存在 localStorage，总览页与模块页共用。 */
const KEY = 'ts:foundations:v1';
export type Progress = Record<string, string>; // topicId -> ISO 时间

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
export function setDone(topicId: string, done: boolean) {
  const p = loadProgress();
  if (done) p[topicId] = new Date().toISOString();
  else delete p[topicId];
  saveProgress(p);
}

/** 更新页面上所有带 data-progress-* 的元素 */
export function renderProgress(root: ParentNode = document) {
  const p = loadProgress();
  const isDone = (id: string) => Boolean(p[id]);

  // 主题级：复选框、卡片、目录项
  root.querySelectorAll<HTMLInputElement>('input[data-topic-check]').forEach((c) => (c.checked = isDone(c.dataset.topicCheck!)));
  root.querySelectorAll<HTMLElement>('[data-topic]').forEach((el) => el.classList.toggle('done', isDone(el.dataset.topic!)));

  // 模块级：data-module-progress="id" 元素内的 .done 计数、进度条、complete 类
  root.querySelectorAll<HTMLElement>('[data-module-progress]').forEach((el) => {
    const ids = (el.dataset.topics || '').split(',').filter(Boolean);
    const n = ids.filter(isDone).length;
    el.querySelectorAll<HTMLElement>('.done-n').forEach((x) => (x.textContent = String(n)));
    el.querySelectorAll<HTMLElement>('.bar').forEach((x) => (x.style.width = `${ids.length ? (100 * n) / ids.length : 0}%`));
    el.classList.toggle('complete', ids.length > 0 && n === ids.length);
  });

  // 全局：data-total-progress
  root.querySelectorAll<HTMLElement>('[data-total-progress]').forEach((el) => {
    const ids = (el.dataset.topics || '').split(',').filter(Boolean);
    const n = ids.filter(isDone).length;
    el.querySelectorAll<HTMLElement>('.done-n').forEach((x) => (x.textContent = String(n)));
    el.querySelectorAll<HTMLElement>('.bar').forEach((x) => (x.style.width = `${ids.length ? (100 * n) / ids.length : 0}%`));
  });
}

export function bindProgress(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[data-topic-check]').forEach((c) => {
    c.addEventListener('change', () => {
      setDone(c.dataset.topicCheck!, c.checked);
      renderProgress(root);
    });
  });
  renderProgress(root);
}
