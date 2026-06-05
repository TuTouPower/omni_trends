# OmniTrends

> 最后更新：2026-06-05

实时热点新闻聚合阅读器，从 100+ 个数据源抓取热门新闻统一展示。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript 5.9 + TanStack Router/Query + UnoCSS |
| 状态 | Jotai (客户端) + TanStack Query (服务端) |
| 构建 | Vite 7 + SWC |
| 服务端 | Nitro (h3) — 支持 Node / Cloudflare Workers / Bun |
| 数据库 | db0 抽象层 → SQLite (本地) / D1 (线上) |
| HTTP | ofetch (封装为 myFetch) |
| HTML 解析 | Cheerio |
| 包管理 | pnpm 10 |

## 核心架构

### 数据源自动注册

`shared/pre-sources.ts` 定义所有源元信息，构建时 `scripts/source.ts` 生成 `sources.json`。服务端 `server/getters.ts` 通过 glob 导入 `server/sources/*.ts` 自动注册 getter：

```typescript
import * as x from "glob:./sources/{*.ts,**/index.ts}"
```

每个源文件导出默认函数，返回 `NewsItem[]`。支持子源（sub），如 `bilibili-hot-search`、`bilibili-hot-video`。

### 数据源抓取方式

全部服务端抓取，两种模式：

| 方式 | 说明 | 示例 |
|------|------|------|
| HTML/API 解析 | ofetch 抓取 → Cheerio/JSON 提取 | weibo、zhihu、bilibili |
| RSS/Feed | defineRSSSource / defineRSSHubSource 封装 | BBC、Guardian、AP News |
| Google News RSS | `news.google.com/rss/search?q=site:xxx.com` | Economist、小红书 |
| 直接 API | 调数据源 JSON API | Huggingface Papers |

工具函数在 `server/utils/source.ts`：defineRSSHubSource / defineRSSSource / proxySource。

### 自适应缓存

两层时间控制（`server/api/s/index.ts`）：

- **interval**：源内容更新频率（微博 2min，Solidot 60min），间隔内直接返缓存
- **TTL**：固定 30min，TTL 外或带 `?latest` 参数才重新抓取

## 目录结构要点

```
shared/
  pre-sources.ts        # 数据源定义（名称、颜色、间隔、分类）
  sources.ts            # 构建生成的源注册表
  types.ts              # NewsItem, Source, SourceResponse
  consts.ts             # TTL、Interval 常量
  metadata.ts           # 栏目分类（国内/国际/科技/财经/关注/实时/最热）

server/
  sources/              # 数据源实现（85 个 .ts 文件）
  api/s/index.ts        # 核心接口：GET /api/s?id=xxx
  utils/source.ts       # defineRSSHubSource / defineRSSSource / proxySource
  utils/rss2json.ts     # RSS 解析器
  utils/fetch.ts        # myFetch 封装（含代理支持）
  utils/crypto.ts       # 加密工具
  utils/date.ts         # 日期工具
  utils/base64.ts       # Base64 编码
  utils/logger.ts       # 日志工具
  getters.ts            # glob 自动注册
  database/cache.ts     # 缓存 CRUD

src/
  components/column/    # 新闻栏目组件
  components/header/    # 头部（含 ThemeToggle）
  hooks/useDark.ts      # 暗色模式 hook
  atoms/                # Jotai atoms
```

## 构建与运行

无 base path 前缀，所有环境直接根路径访问：

| 环境 | 访问地址 | 配置 |
|------|----------|------|
| 本地 | `http://localhost:20193/` | 直接启动 |
| Oracle Docker | `https://trends.zzzkkkccc.site/` | Cloudflare Tunnel → localhost:20229 |
| Cloudflare Pages | `https://omni-trends.pages.dev/` | CF Pages 直部署 |

```bash
pnpm build && PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

### 测试单个源

```bash
curl -s "http://localhost:20193/api/s?id={source_id}"
```

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 默认 3000，本项目用 20193 |
| `PRODUCTHUNT_API_TOKEN` | 否 | Product Hunt 数据源 |

## 当前工作状态

### 已完成

- 新增 14 个数据源（提交 `0b431c3` 和 `dcb6424`）
  - 直接 RSS：BBC、Guardian、NHK、WSJ
  - RSSHub：AP News、Washington Post
  - 自定义解析：Al Jazeera
  - 直接 API：Huggingface Papers
  - Google News RSS：Economist、TechFlow、证券时报、开源中国、SegmentFault
- 启用深色/浅色模式切换（ThemeToggle，默认 auto）
- 下载新源图标到 `public/icons/`
- 数据源修复（2026-05-22）：
  - **freebuf**：改用 `node:https` + RSS feed（ofetch/undici 被 TLS 指纹检测拦截 405）
  - **xiaohongshu**：改用 edith API 热搜接口（需完整移动端 headers 含 shield/xy-common-params）
  - **ghxi（果核剥壳）**：移除 disable 启用，cheerio 解析正常
  - **fastbull**：标记 disable（网站改版为纯 SPA，无公开 API）
  - **mktnews**：标记 disable（API 返回 403）
  - **jianshu**：标记 disable（SSR 只渲染 4 条，其余客户端动态加载，无可用 API）

### 下一步

1. 考虑添加更多国际媒体：Reuters、CCTV、人民网、财新
2. 验证 36kr 快讯是否仍能拿到数据
3. 处理超时源（v2ex、reddit、hackernews 等需要代理的国外源）

### 已知问题

- ESLint `react-dom/no-children-in-void-dom-elements` 报错（项目原有 bug），提交时需临时绕过 lint-staged
- `dev` 模式有兼容性问题，只能 build 后运行
- 36kr 人气榜被 WAF 拦截，无法服务端抓取
- freebuf 有 TLS 指纹检测，必须用 `node:https` 而非 ofetch/undici
- xiaohongshu edith API 的 headers 含硬编码设备指纹，可能随时失效
- smzdm 有 JS challenge 反爬，linuxdo 被墙，均无法服务端抓取

## 注意事项

- 参考项目在 `vendors/`（DailyHotApi、next-daily-hot、HotList-Web），已 gitignore
- 图标查找逻辑：`src/components/column/card.tsx` → `url(/icons/${id.split("-")[0]}.png)`
- RSS 解析用 `rss2json.ts`；ofetch 自动解析 XML 会出错时需加 `responseType: "text"`
- 部分网站有 TLS 指纹检测（如 freebuf），ofetch/undici 会被拦截，需用 `node:https` 模块绕过
- 数据源禁用方式：在 `shared/pre-sources.ts` 对应源配置中加 `disable: true`
- 测试单个源时直接根路径：`curl http://localhost:20193/api/s?id={id}&latest`
- 缓存存储在 `.data/db.sqlite3`，清除特定源缓存：`sqlite3 .data/db.sqlite3 "DELETE FROM cache WHERE id='xxx';"`

## 参考文档

- `docs/cloudflare_deployment.md` — Cloudflare Pages 部署指南
- `docs/archive/` — 历史文档（上游分析、bug 修复记录、部署方案对比）
