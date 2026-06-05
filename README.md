# OmniTrends

![](/public/logo.png)

实时热点新闻聚合阅读器，汇集全球 100+ 个数据源的热门新闻统一展示。

**在线访问**: https://trends.zzzkkkccc.site/

[Forked from NewsNow](https://github.com/ourongxing/newsnow)，在此基础上扩展了更多数据源、代理支持和 bug 修复。

## 特性

- **100+ 个数据源**，覆盖国内媒体、国际媒体、科技、财经
- **代理支持** — `.env.server` 中配置 `HTTPS_PROXY` 走代理（国内访问国外源必需）
- **深色/浅色模式** 切换
- **Cloudflare Tunnel** 子域名直连容器，无需 nginx
- **PWA 支持** — 可安装为桌面应用

## 快速开始

```bash
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

访问 http://localhost:20193/

## 配置

复制 `example.env.server` 为 `.env.server`：

```env
G_CLIENT_ID=
G_CLIENT_SECRET=
JWT_SECRET=
INIT_TABLE=true
ENABLE_CACHE=true
PRODUCTHUNT_API_TOKEN=
```

在 `.env.server` 中额外配置端口和代理（不入 example）：
```env
PORT=20193
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
```

代理可选，但访问国际源（Reddit、HackerNews、BBC 等）需要。

## 部署

三端统一部署脚本 `deploy.sh`：

```bash
bash deploy.sh
```

自动完成：Cloudflare Pages 部署 → Docker 镜像构建 → Oracle 远程服务器部署 → 本地启动。

| 环境 | 地址 |
|------|------|
| 线上 (Tunnel) | https://trends.zzzkkkccc.site/ |
| Cloudflare Pages | https://omni-trends.pages.dev/ |
| Oracle (直连) | http://64.181.252.105/ |
| 本地 | http://localhost:20193/ |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TanStack Router/Query + UnoCSS |
| 后端 | Nitro (h3) — Node.js / Cloudflare Workers |
| 数据库 | SQLite (本地) / D1 (Cloudflare) |
| HTTP | ofetch |
| 构建 | Vite 7 + pnpm |

## 开发

> 需要 Node.js >= 20

```bash
corepack enable
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

> `pnpm dev` 有兼容性问题，使用 build + run。

### 添加数据源

1. 在 `shared/pre-sources.ts` 定义元信息
2. 在 `server/sources/{name}.ts` 创建 getter
3. 重新构建测试：`curl http://localhost:20193/api/s?id={name}&latest`

## 致谢

Forked from [NewsNow](https://github.com/ourongxing/newsnow) by [ourongxing](https://github.com/ourongxing)。原项目 MIT 协议。

## 协议

[MIT](./LICENSE)
