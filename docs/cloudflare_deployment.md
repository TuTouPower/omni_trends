# Cloudflare Pages 部署指南

在线预览：https://omni-trends.pages.dev

## 前提

- Cloudflare 账号
- Node.js >= 20 + pnpm
- 已 fork 并 clone 本仓库

## 步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 登录 Wrangler

```bash
npx wrangler login
```

### 3. 创建 D1 数据库

```bash
npx wrangler d1 create omnitrends-db
```

输出类似：

```
database_name = "omnitrends-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

把 `database_id` 填入 `wrangler.toml`：

```toml
name = "omnitrends"
pages_build_output_dir = "dist/output/public"
compatibility_date = "2024-10-03"
compatibility_flags = [ "nodejs_compat" ]

[[d1_databases]]
binding = "OMNITRENDS_DB"
database_name = "omnitrends-db"
database_id = "<你的 database_id>"
```

### 4. 构建并部署

```bash
CF_PAGES=1 pnpm build
npx wrangler pages deploy dist/output/public --project-name omni-trends
```

首次部署会自动创建 Pages 项目。

### 5. 设置环境变量

在 Cloudflare Dashboard → Pages → 你的项目 → Settings → Environment variables 中添加：

| 变量 | 值 | 说明 |
|------|-----|------|
| `INIT_TABLE` | `true` | 首次部署初始化数据库表 |
| `ENABLE_CACHE` | `true` | 启用数据缓存 |
| `PRODUCTHUNT_API_TOKEN` | `<你的 token>` | ProductHunt API 访问（可选） |

设置后重新部署一次使环境变量生效。

### 6. 后续更新

```bash
CF_PAGES=1 pnpm build
npx wrangler pages deploy dist/output/public --project-name omni-trends --branch master
```

## 与本地部署的区别

| 项目 | 本地 | Cloudflare Pages |
|------|------|------------------|
| 数据库 | SQLite (better-sqlite3) | D1 |
| 运行时 | Node.js | Cloudflare Workers (V8) |
| 代理 | 支持 (undici ProxyAgent) | 不支持（CF 出口 IP） |
| 免费额度 | 无限 | 500 次/天 build，每天 100k 请求 |

## 已知限制

部分网站封禁 Cloudflare Workers 出口 IP，这些数据源在 CF 环境下自动禁用：

| 数据源 | 错误 | 原因 |
|--------|------|------|
| Freebuf | 405 Forbidden | freebuf WAF 封禁 CF IP |
| Reddit (Hot) | 403 Forbidden | Reddit 封禁 CF IP |

代码中通过 `disable: "cf"` 标记，构建时自动排除。本地开发不受影响。

## 相关文件

| 文件 | 说明 |
|------|------|
| `wrangler.toml` | Wrangler 配置（D1 绑定、兼容性标志） |
| `nitro.config.ts` | Nitro 构建配置（`CF_PAGES` 环境检测） |
| `shared/pre-sources.ts` | 数据源定义（`disable: "cf"` 控制） |

## 访问地址

- 生产环境：https://omni-trends.pages.dev
- 自定义域名：在 Cloudflare Dashboard → Pages → Custom domains 中绑定
