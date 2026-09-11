// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages 部署时由工作流注入：
//   SITE_URL  = https://<user>.github.io
//   BASE_PATH = /<repo>/   （若仓库名为 <user>.github.io 则为 /）
//   PUBLIC_REPO = <user>/<repo>  （网站「同步到 GitHub」功能的默认仓库）
//   PUBLIC_GOOGLE_SITE_VERIFICATION = Google Search Console 的 HTML 标签验证码（可选）
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

// 只对本人有意义、内容来自浏览器 localStorage 的页面不进 sitemap
const PRIVATE_PAGES = ['settings/', 'library/'];

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !PRIVATE_PAGES.some((p) => page.endsWith(base + p)),
    }),
  ],
});
