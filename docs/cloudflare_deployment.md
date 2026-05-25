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

**构建时必须带 `CF_PAGES=1`**，这会启用 Cloudflare Pages 专用配置（D1 数据库、cloudflare-pages preset、Vite base `/`）。

```bash
CF_PAGES=1 pnpm build
```

**部署必须指定 `--branch master`**。项目的 Cloudflare Pages 生产分支是 `master`，用其他分支名只会部署到 preview 环境。

```bash
npx wrangler pages deploy dist/output/public --project-name omni-trends --branch master --commit-dirty=true
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

## 本地 vs 线上的 basePath 差异

| 环境 | Vite base | Nitro baseURL | 访问方式 |
|------|-----------|---------------|----------|
| 本地（Node） | `/omni_trends/` | `/omni_trends` | `localhost:20193/omni_trends/` |
| Cloudflare Pages | `/` | 无 | `omni-trends.pages.dev/omni_trends/`（CF 平台处理） |

`vite.config.ts` 和 `nitro.config.ts` 通过 `process.env.CF_PAGES` 自动切换配置。本地开发时需要 `/omni_trends` 前缀（Nitro 会 302 重定向），CF Pages 的平台层自行处理路径映射。

## 常见问题

### 部署后线上没更新

1. 确认用了 `--branch master`（不是 `--branch main`），否则只会部署到 preview
2. 浏览器缓存：Ctrl+Shift+Delete 清除缓存，或用无痕窗口验证
3. Wrangler 显示 "Uploaded 0 files" 是正常的——它会对比 hash 跳过未变化的文件，worker bundle 仍会更新

### 数据源被禁用

部分网站封禁 Cloudflare Workers 出口 IP，这些数据源在 CF 环境下自动禁用（`disable: "cf"` 标记）：

| 数据源 | 错误 | 原因 |
|--------|------|------|
| Freebuf | 405 Forbidden | freebuf WAF 封禁 CF IP |
| Reddit (Hot) | 403 Forbidden | Reddit 封禁 CF IP |

本地开发不受影响。

## 相关文件

| 文件 | 说明 |
|------|------|
| `wrangler.toml` | Wrangler 配置（D1 绑定、兼容性标志） |
| `nitro.config.ts` | Nitro 构建配置（`CF_PAGES` 环境检测，本地 baseURL） |
| `vite.config.ts` | Vite 构建配置（`CF_PAGES` 时 base `/`，本地 `/omni_trends/`） |
| `shared/pre-sources.ts` | 数据源定义（`disable: "cf"` 控制） |

## 访问地址

- 生产环境：https://omni-trends.pages.dev
- 自定义域名：在 Cloudflare Dashboard → Pages → Custom domains 中绑定
