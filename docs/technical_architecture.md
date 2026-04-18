---
version: 1.0
date: 2026-04-19
source: https://github.com/ourongxing/newsnow
local_port: 20193
---

# NewsNow 技术架构分析

## 项目概览

实时热点新闻聚合阅读器，从 30+ 数据源抓取热门/实时新闻，统一展示。纯前端 + SSR 架构，可部署到 Cloudflare Pages、Vercel 或 Node.js。

| 项 | 值 |
|---|---|
| 版本 | v0.0.39 |
| 许可证 | MIT |
| 作者 | ourongxing |
| 运行地址 | http://localhost:20193 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript 5.9 |
| 路由 | TanStack Router |
| 状态管理 | Jotai（atom） + TanStack Query（服务端状态） |
| 样式 | UnoCSS（原子化） |
| 动画 | Framer Motion |
| 构建 | Vite 7 + SWC |
| 服务端 | Nitro（h3）— Node.js / Cloudflare Workers / Bun |
| 数据库 | db0 抽象层 → SQLite（本地）/ Cloudflare D1（线上） |
| HTML 解析 | Cheerio |
| HTTP 客户端 | ofetch |
| 认证 | GitHub OAuth + JWT（jose） |
| PWA | vite-plugin-pwa + Workbox |
| MCP | @modelcontextprotocol/sdk |
| 包管理 | pnpm 10 |

## 系统架构

```
┌──────────────────────────────────────────────────┐
│                    浏览器                          │
│  React 19 + TanStack Router + TanStack Query     │
│  Jotai (状态)  UnoCSS (样式)  Framer Motion      │
└──────────────┬───────────────────────────────────┘
               │ HTTP / MCP
┌──────────────▼───────────────────────────────────┐
│              Nitro Server (h3)                     │
│                                                    │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ API 路由 │  │ 认证中间件│  │   MCP Server     │ │
│  │ /api/*  │  │ JWT 验证  │  │ get_hotest_latest │ │
│  └────┬────┘  └──────────┘  └────────┬─────────┘ │
│       │                              │            │
│  ┌────▼──────────────────────────────▼─────────┐ │
│  │              Source Getters                  │ │
│  │  weibo / zhihu / hackernews / github ...    │ │
│  │  (glob 自动注册，每个源一个 .ts 文件)         │ │
│  └────┬────────────────────────────────────────┘ │
│       │                                            │
│  ┌────▼────────────────────────────────────────┐ │
│  │            Cache Layer (SQLite/D1)           │ │
│  │  TTL: 30min | 自适应间隔: 2min ~ 60min      │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 核心机制

### 1. 数据源注册（glob 自动发现）

`shared/pre-sources.ts` 定义所有数据源元信息，`scripts/source.ts` 在构建时生成 `sources.json`。服务端 `server/getters.ts` 通过 glob 导入 `server/sources/*.ts` 自动注册 getter 函数：

```typescript
// server/getters.ts — glob 自动导入所有数据源
import * as x from "glob:./sources/{*.ts,**/index.ts}"
```

每个源文件导出一个默认函数，返回 `NewsItem[]`。支持子源（sub），如 `bilibili-hot-search`、`bilibili-hot-video`。

### 2. 自适应缓存策略

两层时间控制（`server/api/s/index.ts`）：

- **interval（刷新间隔）**：源内容更新频率。微博 2 分钟，Solidot 60 分钟。在此间隔内直接返回缓存。
- **TTL（缓存过期）**：固定 30 分钟。TTL 内即使有更新也用缓存，除非用户带 `?latest` 参数强制刷新。

```
请求到来
  ├─ interval 内 → 直接返回缓存（success）
  ├─ TTL 内 + 无 latest → 返回缓存（cache）
  └─ TTL 外 或 latest → 重新抓取 → 写入缓存 → 返回（success）
```

### 3. 认证与登录控制

`server/middleware/auth.ts`：若未配置 `G_CLIENT_ID` / `G_CLIENT_SECRET` / `JWT_SECRET`，自动禁用登录（`disabledLogin = true`），但 `/api/s`、`/api/mcp` 等数据接口仍可匿名访问。

### 4. MCP Server

`server/mcp/server.ts` 暴露一个 MCP tool `get_hotest_latest_news`，接收 `{id, count}` 参数，内部调用 `/api/s` 获取数据。支持 Claude、Cursor 等 AI 工具直接读取新闻。

### 5. 数据源抓取方式

全部是**服务端抓取**（非 RSS 代理），两种模式：

| 方式 | 说明 | 示例 |
|------|------|------|
| HTML 解析 | ofetch 抓网页 → Cheerio 提取 | weibo、zhihu、hackernews |
| API 调用 | 直接调数据源 JSON API | bilibili、douyin、github |

抓取统一通过 `myFetch`（ofetch 封装），带 User-Agent、10 秒超时、3 次重试。

## 目录结构

```
newsnow/
├── shared/                  # 前后端共享
│   ├── pre-sources.ts       # 数据源定义（名称、颜色、间隔、分类）
│   ├── sources.ts           # 构建生成的源注册表
│   ├── types.ts             # 类型定义（NewsItem, Source, SourceResponse）
│   ├── consts.ts            # 常量（TTL、Interval、版本号）
│   ├── metadata.ts          # 栏目分类（国内/国际/科技/财经/关注/实时/最热）
│   └── utils.ts             # 工具函数
├── server/                  # 服务端
│   ├── api/                 # API 路由
│   │   ├── s/index.ts       # 核心接口：获取数据源
│   │   ├── s/entire.post.ts # 批量获取
│   │   ├── latest.ts        # 版本信息
│   │   ├── mcp.post.ts      # MCP 协议入口
│   │   ├── enable-login.ts  # 登录状态检查
│   │   ├── login.ts         # 登录入口
│   │   ├── oauth/github.ts  # GitHub OAuth 回调
│   │   └── me/              # 用户相关（同步、信息）
│   ├── sources/             # 数据源实现（40+ 个 .ts 文件）
│   ├── database/            # 数据库操作
│   │   ├── cache.ts         # 缓存 CRUD
│   │   └── user.ts          # 用户数据
│   ├── middleware/           # 中间件
│   │   └── auth.ts          # JWT 认证
│   ├── mcp/                 # MCP Server
│   ├── utils/               # 工具函数（fetch、加密、日期、RSS 解析）
│   └── getters.ts           # 数据源 getter 自动注册
├── src/                     # 前端
│   ├── main.tsx             # 入口
│   ├── routes/              # 页面路由
│   ├── components/          # UI 组件
│   │   ├── column/          # 新闻栏目组件
│   │   ├── common/          # 通用组件
│   │   ├── header/          # 头部
│   │   └── footer.tsx       # 底部
│   ├── hooks/               # 自定义 hooks
│   ├── atoms/               # Jotai atoms
│   ├── styles/              # 全局样式
│   └── utils/               # 前端工具
├── nitro.config.ts          # Nitro 服务端配置
├── vite.config.ts           # Vite 构建配置
├── uno.config.ts            # UnoCSS 配置
├── pwa.config.ts            # PWA 配置
└── scripts/                 # 构建脚本
    ├── source.ts            # 生成 sources.json
    └── favicon.ts           # 抓取各源 favicon
```

## 数据源清单

共 40+ 个数据源，按栏目分类：

### 国内（china）

微博、知乎、抖音、虎扑、百度贴吧、今日头条、澎湃新闻、哔哩哔哩、快手、百度热搜、凤凰网、腾讯新闻、Freebuf、腾讯视频、爱奇艺、豆瓣、什么值得买（禁用）、果核剥壳（禁用）、虫部落、牛客

### 国际（world）

联合早报、卫星通讯社、参考消息、靠谱新闻、Steam

### 科技（tech）

V2EX、IT 之家、Hacker News、Product Hunt、GitHub Trending、Solidot、远景论坛、稀土掘金、少数派

### 财经（finance）

华尔街见闻、36 氪、财联社、雪球、格隆汇、金十数据、MKTNews、法布财经

## 对外 API

服务运行在 `http://localhost:20193`，以下 API 可供外部调用。

### GET /api/s — 获取指定数据源

**必选参数**：`id`（数据源 ID）

**可选参数**：`latest`（任意值，强制刷新跳过缓存）

```
# 获取微博热搜
curl http://localhost:20193/api/s?id=weibo

# 获取知乎热榜
curl http://localhost:20193/api/s?id=zhihu

# 获取 Hacker News
curl http://localhost:20193/api/s?id=hackernews

# 强制刷新（跳过缓存）
curl http://localhost:20193/api/s?id=weibo&latest
```

**响应格式**：

```json
{
  "status": "success | cache",
  "id": "weibo",
  "updatedTime": 1776534865410,
  "items": [
    {
      "id": "标题或唯一标识",
      "title": "新闻标题",
      "url": "https://...",
      "mobileUrl": "https://...",
      "extra": {
        "hover": "悬浮提示",
        "date": "日期",
        "info": "附加信息（如分数、评论数）",
        "icon": { "url": "https://...", "scale": 1.5 }
      }
    }
  ]
}
```

### POST /api/s/entire — 批量获取多个数据源

**请求体**：

```json
{
  "sources": ["weibo", "zhihu", "hackernews"]
}
```

```
curl -X POST http://localhost:20193/api/s/entire \
  -H "Content-Type: application/json" \
  -d '{"sources": ["weibo", "zhihu", "hackernews"]}'
```

**响应**：`SourceResponse[]` 数组，每个元素同 `/api/s` 单个响应格式。

### GET /api/latest — 版本信息

```
curl http://localhost:20193/api/latest
```

**响应**：

```json
{
  "v": "0.0.39"
}
```

### GET /api/enable-login — 登录状态

```
curl http://localhost:20193/api/enable-login
```

返回当前服务是否配置了 GitHub OAuth。

### POST /api/mcp — MCP 协议接口

供 AI 工具（Claude、Cursor 等）使用的 MCP StreamableHTTP 端点。暴露 tool `get_hotest_latest_news`：

```json
{
  "id": "weibo",
  "count": 10
}
```

MCP 配置示例：

```json
{
  "mcpServers": {
    "newsnow": {
      "url": "http://localhost:20193/api/mcp"
    }
  }
}
```

> 旧版 npx 方式：`npx -y newsnow-mcp-server`，设置 `BASE_URL=http://localhost:20193`。

### 可用的数据源 ID 列表

| ID | 名称 | 类型 |
|----|------|------|
| `weibo` | 微博 | hottest |
| `zhihu` | 知乎 | hottest |
| `douyin` | 抖音 | hottest |
| `baidu` | 百度热搜 | hottest |
| `toutiao` | 今日头条 | hottest |
| `hupu` | 虎扑 | hottest |
| `tieba` | 百度贴吧 | hottest |
| `douban` | 豆瓣 | hottest |
| `ithome` | IT 之家 | realtime |
| `thepaper` | 澎湃新闻 | hottest |
| `ifeng` | 凤凰网 | hottest |
| `hackernews` | Hacker News | hottest |
| `github-trending-today` | GitHub Trending | hottest |
| `producthunt` | Product Hunt | hottest |
| `solidot` | Solidot | — |
| `v2ex-share` | V2EX 最新分享 | — |
| `sspai` | 少数派 | hottest |
| `juejin` | 稀土掘金 | hottest |
| `nowcoder` | 牛客 | hottest |
| `coolapk` | 酷安 | hottest |
| `bilibili-hot-search` | B 站热搜 | hottest |
| `36kr-quick` | 36 氪快讯 | realtime |
| `36kr-renqi` | 36 氪人气榜 | hottest |
| `wallstreetcn-quick` | 华尔街见闻快讯 | realtime |
| `wallstreetcn-hot` | 华尔街见闻最热 | hottest |
| `cls-telegraph` | 财联社电报 | realtime |
| `cls-hot` | 财联社热门 | hottest |
| `xueqiu-hotstock` | 雪球热门股票 | hottest |
| `gelonghui` | 格隆汇 | realtime |
| `jin10` | 金十数据 | realtime |
| `zaobao` | 联合早报 | realtime |
| `sputniknewscn` | 卫星通讯社 | — |
| `cankaoxiaoxi` | 参考消息 | — |
| `kaopu` | 靠谱新闻 | — |
| `steam` | Steam 在线人数 | hottest |
| `freebuf` | Freebuf | hottest |
| `qqvideo-tv-hotsearch` | 腾讯视频热搜 | hottest |
| `iqiyi-hot-ranklist` | 爱奇艺热播榜 | hottest |
| `tencent-hot` | 腾讯新闻综合早报 | hottest |
| `mktnews-flash` | MKTNews 快讯 | realtime |
| `fastbull-express` | 法布财经快讯 | realtime |
| `fastbull-news` | 法布财经头条 | — |

## 部署配置

### 本地运行（当前方式）

```bash
pnpm i
pnpm build
PORT=20193 node --env-file .env.server dist/output/server/index.mjs
```

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | 3000 | 监听端口 |
| `G_CLIENT_ID` | 否 | — | GitHub OAuth Client ID |
| `G_CLIENT_SECRET` | 否 | — | GitHub OAuth Client Secret |
| `JWT_SECRET` | 否 | — | JWT 签名密钥 |
| `INIT_TABLE` | 否 | true | 首次运行建表 |
| `ENABLE_CACHE` | 否 | true | 启用缓存 |
| `PRODUCTHUNT_API_TOKEN` | 否 | — | Product Hunt API Token |

> 不配置 OAuth 三件套时，登录功能自动禁用，但数据 API 和 MCP 正常可用。

## 代码质量

| 维度 | 评价 |
|------|------|
| 类型安全 | 优秀。TypeScript 严格模式，SourceID 用模板字面量类型推导 |
| 代码组织 | 优秀。glob 自动注册、shared 前后端共享、职责清晰 |
| 测试 | 偏弱。仅有 `server/utils/date.test.ts`，覆盖率低 |
| 文档 | README 清晰，CONTRIBUTING.md 有数据源贡献指南 |
| 构建产物 | ~7.32 MB，gzip 后 ~2.73 MB |

## 优缺点评价

### 亮点

1. **零配置可用**：不配 OAuth 也能跑，数据 API 直接可用
2. **数据源架构优雅**：glob 自动注册，新增数据源只需加一个 .ts 文件
3. **自适应缓存**：按源更新频率动态调整间隔，减少无效请求
4. **多平台部署**：Nitro 抽象让同一套代码跑在 Node / CF Workers / Bun 上
5. **MCP 支持**：开箱即用的 AI 工具集成

### 潜在问题

1. **爬虫稳定性**：HTML 解析依赖页面结构，源站改版即失效。微博等源硬编码了 Cookie
2. **dev 模式兼容性**：`h3-nightly` + `srvx` 在 Node 22 下有 bug，只能 build 模式运行
3. **测试覆盖不足**：核心抓取逻辑无测试
4. **SQL 拼接**：`getEntire` 用字符串拼接 WHERE 条件（`server/database/cache.ts:44`），虽是内部调用但不够安全

## 适用场景

**适合**：个人新闻聚合、信息流监控、作为其他项目的新闻数据源 API

**不适合**：需要高可靠性的生产环境（爬虫随时可能失效）、需要英文内容（当前仅中文源为主）

## 讨论记录

### 2026-04-19 本地部署问题修复

#### 1. 代理支持

ofetch 默认不读 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量。修改 `server/utils/fetch.ts`，安装 `undici` 并在启动时用 `setGlobalDispatcher(new ProxyAgent(...))` 设置全局代理。

修改后 hackernews、v2ex、zaobao、mktnews-flash 等海外源恢复正常。

#### 2. 数据源修复

| 数据源 | 问题 | 修复方式 |
|--------|------|----------|
| freebuf | 源站改版 + ofetch 的 `sec-fetch-mode: cors` 头触发 405 | 改用 Node.js 原生 `https.get` 请求，从 `__NUXT__` SSR 数据中提取文章（仅首页 banner 5 篇） |
| fastbull-express | 页面结构从 `.news-list .title_name` 变为 `.news-list[data-date] .title_name` | 更新 Cheerio 选择器，用 `data-date` 和 `data-href` 属性提取 |
| fastbull-news | 同上 | 同上 |
| 36kr-renqi | 36kr 部署了 WAF JS Challenge，服务端无法执行 JS | 无法修复，需 headless browser 或 API 接口 |
| producthunt | 未配置 API Token | 需用户去 Product Hunt 注册 API Token 填入 `.env.server` |

#### 3. freebuf 数据量限制

freebuf 文章列表改为纯客户端渲染（CSR），服务端 HTML 只有 5 篇 banner 文章的 `__NUXT__` 数据。获取完整列表需要找到客户端调用的 API 接口或使用 headless browser。
