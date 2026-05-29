# Bug: 前端 API baseURL 未跟随 Nitro basePath，子路径部署失败

## 状态

已修复（2026-05-29）

## 修复方案

使用 Vite 内置的 `import.meta.env.BASE_URL` 动态获取 basePath，在构建时自动注入正确值：

- Cloudflare Pages: `BASE_URL = "/"` → API: `/api`
- node-server: `BASE_URL = "/omni_trends/"` → API: `/omni_trends/api`

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/utils/index.ts` | `baseURL: "/api"` → `` baseURL: `${import.meta.env.BASE_URL}api` `` |
| `src/components/header/index.tsx` | favicon 和爱发电图片路径加 `BASE_URL` 前缀 |
| `src/components/column/card.tsx` | 图标路径加 `BASE_URL` 前缀 |
| `src/components/column/dnd.tsx` | 拖拽卡片图标路径加 `BASE_URL` 前缀 |
| `src/components/common/search-bar/index.tsx` | 搜索栏图标路径加 `BASE_URL` 前缀 |

## 复现条件

使用 Nitro node-server preset 且设置 `baseURL` 为非根路径（如 `/omni_trends`）时，通过反向代理（nginx）将应用部署到子路径。

## 复现步骤

1. `nitro.config.ts` 中 node-server 分支设置了 `baseURL = "/omni_trends"`
2. 构建部署到服务器，容器监听 4444 端口
3. nginx 配置 `location /omni_trends/` 反代到 `localhost:20229`
4. 浏览器访问 `http://host/omni_trends/`
5. 页面加载成功，但所有 API 请求 404

## 实际行为

浏览器 F12 Network 显示请求路径：

```
GET /api/s?id=weibo           → 404
GET /api/s/entire             → 404
GET /api/enable-login         → 404
GET /favicon.png              → 404
GET /weibo.png                → 404
```

所有请求缺少 `/omni_trends` 前缀，直接发到了根路径。

## 期望行为

```
GET /omni_trends/api/s?id=weibo       → 200
GET /omni_trends/api/s/entire         → 200
GET /omni_trends/api/enable-login     → 200
GET /omni_trends/favicon.png          → 200
GET /omni_trends/weibo.png            → 200
```

前端所有请求应自动携带 Nitro 的 `baseURL` 前缀。

## 根因分析

`nitro.config.ts` 的 `baseURL` 设置只影响服务端：

- 服务端路由注册在 `/omni_trends/api/*`（正确）
- HTML 中的资源引用带 `/omni_trends/` 前缀（正确）
- JS bundle 中 `src="/omni_trends/assets/index-xxx.js"`（正确）

但前端 API 客户端的 baseURL 独立硬编码为 `/api`，没有读取 Nitro 的 `baseURL` 配置。

构建产物 JS 中的证据：

```js
// index-xxx.js 中
baseURL: "/api"
```

这个值是构建时写死的，与 Nitro 的 `baseURL` 完全无关。

## 影响范围

仅影响使用 `baseURL`（非根路径）部署的场景：

- node-server preset + nginx 子路径部署
- 自定义 basePath 的任何反向代理场景

不影响：

- Cloudflare Pages（CF_PAGES preset，无 basePath）
- Vercel（VERCEL preset，无 basePath）
- 本地 `pnpm dev`（Vite dev server 自动处理）
- 根路径部署（basePath 为 `/`）

## 涉及文件

| 文件 | 角色 |
|------|------|
| `nitro.config.ts` | 定义 `baseURL = "/omni_trends"`（node-server 分支） |
| 前端 API 客户端代码 | 定义 `baseURL: "/api"`（需修改为动态读取 basePath） |

## 修复方向

前端 API 客户端的 baseURL 应从 Nitro 的 `baseURL` 配置中动态获取，而不是硬编码 `/api`。

可能的方案：

1. 构建时通过 Vite 环境变量注入 basePath，前端读取后拼接为 `${basePath}/api`
2. 前端使用相对路径（如 `./api` 或 `api/`），避免绝对路径
3. 从 `import.meta.env` 或 `useRuntimeConfig()` 中读取服务端的 baseURL

## 部署环境参考

当前部署架构：

```text
浏览器
  │ http://host/omni_trends/
  ▼
nginx :80
  │ /omni_trends/ → proxy_pass http://127.0.0.1:20229/omni_trends/
  ▼
omni_trends 容器 :4444
  │ Nitro baseURL = "/omni_trends"
  │ 服务端路由: /omni_trends/api/*  ✓
  │ 前端请求: /api/*                ✗ (应为 /omni_trends/api/*)
```
