# OmniTrends

![](/public/logo.png)

实时热点新闻聚合阅读器 — 基于 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发，扩展了更多数据源、代理支持和 bug 修复。

**在线预览**: https://omni-trends.pages.dev

[English](README.md) | [部署到 Cloudflare](docs/cloudflare_deployment.md)

## 与原版的区别

- **98 个数据源**（原版约 40 个），覆盖国内、国际媒体、科技、财经
- **代理支持** — 在 `.env.server` 配置 `HTTPS_PROXY` 即可访问被墙站点
- **修复多个失效源** — freebuf（TLS 指纹绕过）、小红书（edith API）等
- **深色/浅色模式**切换
- **Cloudflare Tunnel** basePath 支持（`/omni_trends`）

## 快速开始

```bash
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

## 配置

复制 `example.env.server` 为 `.env.server`：

```env
PORT=20193
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
G_CLIENT_ID=
G_CLIENT_SECRET=
JWT_SECRET=
INIT_TABLE=true
ENABLE_CACHE=true
```

代理为可选项，但访问国际源（Reddit、HackerNews、BBC、纽约时报等）时必须配置。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TanStack Router/Query + UnoCSS |
| 后端 | Nitro (h3) — Node.js / Cloudflare Workers |
| 数据库 | SQLite（本地）/ D1（Cloudflare） |
| HTTP | ofetch + undici ProxyAgent |
| 构建 | Vite 7 + pnpm |

## 数据源

完整列表见 [docs/source_status.md](docs/source_status.md)，共 98 个正常源、5 个已禁用源。

## 开发

> 需要 Node.js >= 20

```bash
corepack enable
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

> `pnpm dev` 有兼容性问题，请用 build + run 方式。

### 添加数据源

1. 在 `shared/pre-sources.ts` 定义元信息
2. 在 `server/sources/{name}.ts` 创建抓取逻辑
3. 重新构建并测试：`curl http://localhost:20193/omni_trends/api/s?id={name}&latest`

## 致谢

基于 [ourongxing](https://github.com/ourongxing) 的 [NewsNow](https://github.com/ourongxing/newsnow) 二次开发，原项目采用 MIT 协议。

## 许可证

[MIT](./LICENSE)
