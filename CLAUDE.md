# NewsNow

> 最后更新：2026-04-19

实时热点新闻聚合阅读器，从 40+ 数据源抓取热门新闻统一展示。

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

### 认证

`server/middleware/auth.ts`：未配 `G_CLIENT_ID` / `G_CLIENT_SECRET` / `JWT_SECRET` 时自动禁用登录，但 `/api/s`、`/api/mcp` 等数据接口仍可匿名访问。

## 目录结构要点

```
shared/
  pre-sources.ts        # 数据源定义（名称、颜色、间隔、分类）
  sources.ts            # 构建生成的源注册表
  types.ts              # NewsItem, Source, SourceResponse
  consts.ts             # TTL、Interval 常量
  metadata.ts           # 栏目分类（国内/国际/科技/财经/关注/实时/最热）

server/
  sources/              # 数据源实现（40+ 个 .ts 文件）
  api/s/index.ts        # 核心接口：GET /api/s?id=xxx
  utils/source.ts       # defineRSSHubSource / defineRSSSource / proxySource
  utils/rss2json.ts     # RSS 解析器
  utils/fetch.ts        # myFetch 封装（含代理支持）
  getters.ts            # glob 自动注册
  database/cache.ts     # 缓存 CRUD
  middleware/auth.ts    # JWT 认证

src/
  components/column/    # 新闻栏目组件
  components/header/    # 头部（含 ThemeToggle）
  hooks/useDark.ts      # 暗色模式 hook
  atoms/                # Jotai atoms
```

## 构建与运行

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
| `G_CLIENT_ID` | 否 | GitHub OAuth |
| `G_CLIENT_SECRET` | 否 | GitHub OAuth |
| `JWT_SECRET` | 否 | JWT 签名 |
| `PRODUCTHUNT_API_TOKEN` | 否 | Product Hunt 数据源 |

## 当前工作状态

### 已完成

- 新增 14 个数据源（提交 `0b431c3` 和 `dcb6424`）
  - 直接 RSS：BBC、Guardian、NHK、WSJ
  - RSSHub：AP News、Washington Post
  - 自定义解析：Al Jazeera
  - 直接 API：Huggingface Papers
  - Google News RSS：Economist、TechFlow、证券时报、开源中国、SegmentFault、小红书
- 启用深色/浅色模式切换（ThemeToggle，默认 auto）
- 下载新源图标到 `public/icons/`

### 下一步

1. 逐个测试之前新增的 25 个源（geekpark、guokr、hellogithub、csdn 等）
2. 考虑添加更多国际媒体：Reuters、CCTV、人民网、财新
3. 验证 36kr 快讯是否仍能拿到数据

### 已知问题

- ESLint `react-dom/no-children-in-void-dom-elements` 报错（项目原有 bug），提交时需临时绕过 lint-staged
- `dev` 模式有兼容性问题，只能 build 后运行
- 36kr 人气榜被 WAF 拦截，无法服务端抓取

## 注意事项

- 参考项目在 `vendors/`（DailyHotApi、next-daily-hot、HotList-Web），已 gitignore
- 图标查找逻辑：`src/components/column/card.tsx` → `url(/icons/${id.split("-")[0]}.png)`
- RSS 解析用 `rss2json.ts`；ofetch 自动解析 XML 会出错时需加 `responseType: "text"`

## 详细参考文档

- `docs/technical_architecture.md` — 完整技术架构分析、API 文档、数据源清单
- `docs/github_issues_report.md` — 上游 GitHub Issues 分析报告
