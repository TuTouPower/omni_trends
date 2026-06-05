# Cloudflare Pages 部署指南

在线预览：https://omni-trends.pages.dev/

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

**部署路径必须是 `dist/output/public`**（不是 `dist/output`）。

**必须指定 `--branch main`**，匹配项目的生产分支。

```bash
npx wrangler pages deploy dist/output/public --branch main --commit-dirty=true
```

首次部署会自动创建 Pages 项目。

### 5. 设置环境变量

在 Cloudflare Dashboard → Pages → 项目 → Settings → Environment variables 中添加：

| 变量 | 值 | 说明 |
|------|-----|------|
| `INIT_TABLE` | `true` | 首次部署初始化数据库表 |
| `ENABLE_CACHE` | `true` | 启用数据缓存 |
| `PRODUCTHUNT_API_TOKEN` | `<你的 token>` | ProductHunt API 访问（可选） |

设置后重新部署一次使环境变量生效。

## 本地 vs 线上

所有环境统一使用根路径 `/` 访问，无 basePath 前缀：

| 环境 | Vite base | 访问方式 |
|------|-----------|----------|
| 本地（Node） | `/` | `localhost:20193/` |
| Cloudflare Pages | `/` | `omni-trends.pages.dev/` |

`vite.config.ts` 中 `base: "/"` 硬编码，所有环境统一。

## 踩坑记录

### 生产分支错误：部署到 Preview 而非 Production

**现象：** `wrangler pages deploy` 成功，但线上内容不更新。

**原因：** Cloudflare Pages 项目的生产分支设为 `master`，而代码在 `main` 分支。不指定 `--branch` 或指定 `--branch main` 会部署到 Preview 环境。

**解决：**
1. 在 Cloudflare Dashboard → Pages → 项目 → Settings → Branches 中，将 Production branch 改为 `main`
2. 部署时加 `--branch main`

### 部署路径错误

**现象：** 部署成功但访问 404 或返回 HTML 而非静态资源。

**原因：** `wrangler pages deploy` 的路径必须是包含 `_worker.js` 的目录，即 `dist/output/public`，不是 `dist/output`。

**解决：**
```bash
# 错误
npx wrangler pages deploy dist/output --branch main

# 正确
npx wrangler pages deploy dist/output/public --branch main
```

### 中文文件名在 CF Pages 上 404

**现象：** 爱发电图片（`爱发电.jpg`）在本地正常，CF 上加载失败。

**原因：** Cloudflare Pages 对中文文件名的 URL 编码处理有问题。浏览器请求 `%E7%88%B1%E5%8F%91%E7%94%B5.jpg`，CF Pages 找不到匹配文件，返回 SPA fallback（index.html）。

**解决：** 文件名改用纯 ASCII（`ai_fa_dian.jpg`），代码中同步更新引用。

**规则：** `public/` 目录下的所有文件名必须是纯 ASCII（字母、数字、连字符、下划线、点）。

### Wrangler 显示 "Uploaded 0 files"

**正常现象。** Wrangler 对比文件 hash 跳过未变化的文件，但 Worker bundle 仍会更新。如果线上没更新，检查分支和路径是否正确。

## 数据源与 CF 环境

### disable: "cf" 机制

`shared/pre-sources.ts` 中 `disable: "cf"` 标记的源在 CF 构建时被排除：

```typescript
// genSources() 过滤逻辑
if (v.disable === "cf" && process.env.CF_PAGES) {
  return false
}
```

当前被排除的源：

| 数据源 | 原因 |
|--------|------|
| bilibili-hot-video | CF 出口 IP 被封 |
| bilibili-ranking | CF 出口 IP 被封 |
| kuaishou | CF 出口 IP 被封 |

### "最热" 栏目分类

数据源在"最热"栏目显示由 `type: "hottest"` 控制，与 `disable` 无关。去掉 `type: "hottest"` 后，源仍正常抓取，只是不在"最热"列展示。

## 相关文件

| 文件 | 说明 |
|------|------|
| `wrangler.toml` | Wrangler 配置（D1 绑定、兼容性标志） |
| `nitro.config.ts` | Nitro 构建配置（`CF_PAGES` 环境检测） |
| `vite.config.ts` | Vite 构建配置（base: "/"，所有环境统一） |
| `shared/pre-sources.ts` | 数据源定义（`disable: "cf"` 控制） |

## 访问地址

- 生产环境：https://omni-trends.pages.dev/
- 自定义域名：在 Cloudflare Dashboard → Pages → Custom domains 中绑定
