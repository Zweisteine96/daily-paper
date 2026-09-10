// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 部署时由工作流注入：
//   SITE_URL  = https://<user>.github.io
//   BASE_PATH = /<repo>/   （若仓库名为 <user>.github.io 则为 /）
//   PUBLIC_REPO = <user>/<repo>  （网站「同步到 GitHub」功能的默认仓库）
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    format: 'directory',
  },
});
