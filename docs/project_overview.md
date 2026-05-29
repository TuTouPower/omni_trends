# OmniTrends 项目文档

> 最后更新：2026-05-29

---

## 一、项目概述

OmniTrends 是一个**实时热点新闻聚合阅读器**，从 98 个数据源抓取热门新闻，在一个页面内统一展示。用户无需逐个打开微博、知乎、B站、GitHub、Reddit 等平台，即可一览全网热点。

- **仓库**：https://github.com/TuTouPower/omni_trends
- **作者**：TuTouPower
- **版本**：0.0.39
- **包管理**：pnpm 10

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 19 + TypeScript 5.9 | 最新 React + 严格类型 |
| 路由 | TanStack Router | 文件系统路由，类型安全 |
| 服务端状态 | TanStack Query | 数据获取、缓存、自动刷新 |
| 客户端状态 | Jotai | 原子化状态管理 |
| CSS 方案 | UnoCSS | 原子化 CSS，按需生成 |
| 构建工具 | Vite 7 + SWC | 极速构建和编译 |
| 服务端运行时 | Nitro (h3) | 跨平台服务端框架 |
| 数据库 | db0 → SQLite / D1 | 本地用 SQLite，线上用 Cloudflare D1 |
| HTTP 客户端 | ofetch (myFetch) | 统一请求封装，支持代理 |
| HTML 解析 | Cheerio | 服务端 HTML 抓取与解析 |
| PWA | vite-plugin-pwa | 离线支持、可安装 |
| 国际化 | react-i18next | 中英双语 |

### 2.2 整体架构图

```
┌─────────────────────────────────────────────────┐
│                   浏览器 (Client)                 │
│  React 19 + TanStack Router/Query + Jotai       │
│  UnoCSS + PWA + i18n                            │
├─────────────────────────────────────────────────┤
│                 Nitro Server (h3)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ API 路由  │  │ 缓存层   │  │ 认证中间件    │ │
│  │ /api/s   │  │ SQLite   │  │ GitHub OAuth  │ │
│  │ /api/mcp │  │ / D1     │  │ + JWT         │ │
│  └────┬─────┘  └──────────┘  └───────────────┘ │
│       │                                          │
│  ┌────▼─────────────────────────────────────┐   │
│  │          数据源抓取引擎                    │   │
│  │  98 个 getter（glob 自动注册）            │   │
│  │  ├── HTML/API 解析（ofetch + Cheerio）    │   │
│  │  ├── RSS/Feed（defineRSSSource）          │   │
│  │  ├── RSSHub（defineRSSHubSource）         │   │
│  │  ├── Google News RSS（site: 搜索）        │   │
│  │  └── 直接 API（Huggingface 等）           │   │
│  └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│              运行环境（多平台支持）               │
│  Node.js │ Cloudflare Pages │ Vercel Edge │ Bun │
└─────────────────────────────────────────────────┘
```

### 2.3 目录结构

```
omni_trends/
├── shared/
│   ├── pre-sources.ts      # 数据源元信息定义（98 个源）
│   ├── sources.ts          # 构建生成的源注册表
│   ├── types.ts            # 类型定义（NewsItem, Source, SourceResponse）
│   ├── consts.ts           # TTL=30min, Interval=10min 常量
│   ├── metadata.ts         # 栏目分类（国内/国际/科技/财经/关注/实时/最热）
│   └── dir.ts              # 项目路径工具
├── server/
│   ├── sources/            # 数据源实现（50+ 个 .ts 文件，5846 行代码）
│   ├── api/
│   │   └── s/index.ts      # 核心 API：GET /api/s?id=xxx&latest
│   ├── utils/
│   │   ├── source.ts       # defineRSSSource / defineRSSHubSource / proxySource
│   │   ├── rss2json.ts     # RSS XML 解析器
│   │   └── fetch.ts        # myFetch 封装（代理支持）
│   ├── database/cache.ts   # 缓存 CRUD（db0 抽象）
│   ├── getters.ts          # glob 自动注册所有数据源 getter
│   └── middleware/auth.ts  # JWT + GitHub OAuth 认证
├── src/
│   ├── components/
│   │   ├── column/         # 新闻栏目组件（card、dnd 拖拽排序）
│   │   ├── header/         # 顶部导航（logo、语言切换、菜单）
│   │   ├── common/         # 通用组件（搜索栏、Toast、滚动条、拖拽）
│   │   ├── footer.tsx      # 页脚
│   │   └── navbar.tsx      # 导航栏
│   ├── hooks/              # 自定义 hooks（useDark、useLang 等）
│   ├── atoms/              # Jotai atoms（客户端状态）
│   ├── routes/             # TanStack Router 页面路由
│   └── styles/             # 全局样式
├── public/
│   ├── icons/              # 数据源图标
│   ├── favicon.png         # 网站图标
│   └── 爱发电.jpg           # 赞助入口
├── scripts/
│   ├── source.ts           # 构建脚本：生成 sources.json
│   └── favicon.ts          # 构建脚本：生成 PWA 图标
├── nitro.config.ts         # Nitro 服务端配置（多 preset）
├── vite.config.ts          # Vite 构建配置
├── pwa.config.ts           # PWA 配置
├── wrangler.toml           # Cloudflare Pages/D1 配置
├── Dockerfile              # Docker 多阶段构建
├── docker-compose.yml      # Docker Compose 部署模板
└── .github/workflows/
    ├── docker.yml          # Docker 镜像构建与推送
    └── release.yml         # 自动生成 Changelog
```

---

## 三、核心功能与原理

### 3.1 数据源自动注册

**原理**：声明式定义 + 构建时生成 + 运行时自动加载

1. **声明**：在 `shared/pre-sources.ts` 中定义每个数据源的元信息：

```typescript
export const originSources = {
  "weibo": {
    name: "微博",
    type: "hottest",       // hottest | realtime
    column: "china",       // 国内/国际/科技/财经
    color: "red",
    home: "https://weibo.com",
    interval: Time.Realtime,  // 2min 刷新间隔
  },
  // ... 98 个源
}
```

2. **构建**：`scripts/source.ts` 读取元信息，生成 `sources.json` 和 `sources.ts`

3. **注册**：`server/getters.ts` 通过 glob 导入所有源实现：

```typescript
import * as x from "glob:./sources/{*.ts,**/index.ts}"
```

每个源文件导出默认函数，返回 `NewsItem[]`。新增源只需：
- 在 `pre-sources.ts` 加一行元信息
- 在 `server/sources/` 下创建对应 `.ts` 文件

### 3.2 数据源抓取方式

项目支持 4 种抓取模式，覆盖不同网站的反爬策略：

| 方式 | 实现位置 | 适用场景 | 示例 |
|------|----------|----------|------|
| HTML/API 解析 | ofetch + Cheerio | 有公开 API 或可解析 HTML 的站点 | weibo、zhihu、bilibili |
| RSS/Feed | `defineRSSSource()` | 提供 RSS 输出的站点 | BBC、Guardian、NHK |
| RSSHub 代理 | `defineRSSHubSource()` | RSSHub 支持的站点 | AP News、Washington Post |
| Google News RSS | `news.google.com/rss/search?q=site:xxx.com` | 没有公开 API 的国际媒体 | Economist、WSJ |
| 直接 API | ofetch 直接调 JSON | 提供结构化 JSON API 的站点 | Huggingface Papers |

**特殊处理**：
- **TLS 指纹检测**（freebuf）：ofetch/undici 会被拦截，改用 `node:https` 模块
- **移动端 API**（小红书）：需完整移动端 headers（shield、xy-common-params）
- **JS 反爬**（smzdm）：有 JS Challenge，无法服务端抓取，标记 `disable`

### 3.3 自适应缓存机制

两层时间控制，平衡新鲜度和服务器压力：

```
用户请求 /api/s?id=weibo
        │
        ▼
┌── 缓存存在？ ──┐
│ 否              │ 是
▼                 ▼
抓取新数据     距上次更新 < interval？
                  │          │
                  │ 是       │ 否
                  ▼          ▼
              返回缓存    距上次更新 < TTL（30min）？
                          │              │
                          │ 是           │ 否
                          ▼              ▼
                     返回缓存      带latest参数？
                                  │          │
                                  │ 是       │ 否
                                  ▼          ▼
                              抓取新数据  返回缓存
```

- **interval**：源内容更新频率（微博 2min、Solidot 60min），间隔内直接返缓存
- **TTL**：固定 30min，TTL 外且带 `?latest` 参数才重新抓取
- **降级**：抓取失败时返回过期缓存，不展示错误

### 3.4 栏目分类系统

7 个栏目，自动按数据源元信息归类：

| 栏目 | 说明 | 包含的源（部分） |
|------|------|------------------|
| 国内 (china) | 国内新闻热点 | 微博、知乎、百度、头条、B站 |
| 国际 (world) | 国际新闻 | BBC、NYTimes、Al Jazeera、AP News |
| 科技 (tech) | 科技资讯 | GitHub、HackerNews、ProductHunt、V2EX |
| 财经 (finance) | 财经数据 | 雪球、华尔街见闻、同花顺 |
| 关注 (focus) | 用户自定义收藏 | 空，用户自选 |
| 实时 (realtime) | 实时更新源 | 36kr 快讯、微博热搜 |
| 最热 (hottest) | 各平台热榜聚合 | 抖音、小红书、B站、知乎等 40+ 源 |

支持拖拽排序、自定义显示/隐藏。

### 3.5 认证系统

- **GitHub OAuth 登录**：通过 `G_CLIENT_ID` / `G_CLIENT_SECRET` 配置
- **JWT Token**：登录后签发 JWT，后续请求携带 `Authorization: Bearer <token>`
- **无配置降级**：未配置 OAuth 时自动禁用登录功能，但 `/api/s`、`/api/mcp` 等数据接口仍可匿名访问

### 3.6 国际化 (i18n)

中英双语支持，"最热"栏目按用户语言自动排序：
- 中文：抖音、小红书、微博排前面
- 英文：Reddit、GitHub、主流中文平台排前面

### 3.7 PWA 支持

通过 `vite-plugin-pwa` 实现：
- 可安装到桌面/手机主屏
- Service Worker 缓存静态资源
- API 请求不缓存（`navigateFallbackDenyList: [/^\/api/]`）

---

## 四、构建与运行

### 4.1 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式（注意：dev 模式有兼容性问题，建议 build 后运行）
pnpm dev

# 生产构建
pnpm build

# 运行生产服务
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

### 4.2 测试单个数据源

```bash
# 本地 Node 模式（有 basePath）
curl "http://localhost:20193/omni_trends/api/s?id=weibo&latest"

# Cloudflare Pages 模式（无 basePath）
curl "http://localhost:8788/api/s?id=weibo&latest"
```

### 4.3 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `HOST` | 否 | localhost | 监听地址 |
| `G_CLIENT_ID` | 否 | - | GitHub OAuth Client ID |
| `G_CLIENT_SECRET` | 否 | - | GitHub OAuth Client Secret |
| `JWT_SECRET` | 否 | - | JWT 签名密钥 |
| `PRODUCTHUNT_API_TOKEN` | 否 | - | Product Hunt 数据源 |
| `CF_PAGES` | 否 | - | 设为 `1` 启用 Cloudflare Pages 模式 |
| `INIT_TABLE` | 否 | - | 启动时初始化数据库表 |
| `ENABLE_CACHE` | 否 | - | 启用缓存 |

---

## 五、多平台部署支持

Nitro 框架支持多种运行时 preset，通过环境变量切换：

### 5.1 Node.js 服务器（默认）

```bash
pnpm build
PORT=20193 node dist/output/server/index.mjs
```

- basePath: `/omni_trends/`
- 数据库: SQLite（本地文件 `.data/db.sqlite3`）
- 适合: VPS、自建服务器、Docker

### 5.2 Cloudflare Pages

```bash
CF_PAGES=1 pnpm build
wrangler pages deploy dist/output/public
```

- basePath: `/`（无前缀）
- 数据库: Cloudflare D1（绑定名 `OMNITRENDS_DB`）
- 已配置 `wrangler.toml`，D1 database_id: `b8ed5eb0-...`

### 5.3 Vercel Edge

```bash
VERCEL=1 pnpm build
```

- 无数据库（需自行接入外部数据库）
- 适合: Vercel 平台用户

### 5.4 Bun 运行时

```bash
BUN=1 pnpm build
bun run dist/output/server/index.mjs
```

- 数据库: bun:sqlite

### 5.5 Docker 部署

```bash
docker compose up -d
```

- 多阶段构建，最终镜像仅包含构建产物
- 支持 `linux/amd64` + `linux/arm64`
- 数据持久化: Docker Volume `omnitrends_data`

---

## 六、现有 CI/CD 配置

### 6.1 GitHub Actions Workflows

项目有 2 个 workflow：

#### docker.yml — Docker 镜像构建与推送

- **触发条件**：`push tags: v*` 或手动 `workflow_dispatch`
- **功能**：
  1. 检出代码
  2. 设置 QEMU + Buildx（多平台构建）
  3. 登录 GHCR（GitHub Container Registry）
  4. 提取 metadata（版本标签）
  5. 构建并推送镜像到 `ghcr.io/tutoupower/omni_trends`
- **平台**：`linux/amd64` + `linux/arm64`
- **标签规则**：`latest`、分支名、语义化版本号

#### release.yml — 自动生成 Changelog

- **触发条件**：`push tags: v*`
- **功能**：使用 `changelogithub` 自动生成 Release Notes

### 6.2 当前问题

- **镜像从未发布**：仓库没有任何 git tag，CI 从未触发
- **无自动部署**：CI 只构建镜像，不部署到任何服务器
- **Cloudflare 未自动化**：`pnpm deploy` 脚本存在，但未接入 CI

---

## 七、自动部署方案对比

### 方案 A：Docker 镜像 + SSH 自动部署

**原理**：打 tag → CI 构建镜像推 GHCR → SSH 到服务器拉取新镜像并重启

```
开发者  ──tag v1.0.0──▶  GitHub Actions
                              │
                              ├─▶ 构建 Docker 镜像
                              │   (amd64 + arm64)
                              │
                              ├─▶ 推送 ghcr.io/tutoupower/omni_trends
                              │   标签: latest, v1.0.0, 1.0
                              │
                              └─▶ SSH 到远程服务器
                                  docker compose pull
                                  docker compose up -d
```

**需要的 GitHub Secrets**：
| Secret | 说明 |
|--------|------|
| `SERVER_HOST` | 服务器 IP 或域名 |
| `SERVER_USER` | SSH 用户名 |
| `SSH_PRIVATE_KEY` | SSH 私钥 |

**优点**：
- 已有 Docker workflow，改动最小
- Docker 镜像可用于任何 Docker 环境
- 支持多架构（amd64 + arm64）
- 回滚简单：`docker compose` 指定旧版本 tag

**缺点**：
- 需要自备服务器，有运维成本
- 服务器需要安装 Docker
- SSH 密钥管理需要注意安全
- 国内服务器拉 GHCR 可能很慢（需配镜像加速）

**适用场景**：已有 VPS、需要完全控制运行环境、有特殊网络需求（代理抓取国外源）

---

### 方案 B：Cloudflare Pages 自动部署

**原理**：Cloudflare 直连 GitHub 仓库，push 代码自动触发构建部署

```
开发者  ──push main──▶  GitHub
                         │
                         ├─▶ Cloudflare 自动检测 push
                         │   触发 Pages 构建
                         │
                         │   构建命令: pnpm build
                         │   环境变量: CF_PAGES=1
                         │
                         └─▶ 部署到 Cloudflare Pages
                             绑定 D1 数据库
                             自定义域名（可选）
```

**配置步骤**：
1. Cloudflare Dashboard → Pages → 创建项目 → 连接 GitHub 仓库
2. 构建设置：
   - 构建命令：`pnpm build`
   - 输出目录：`dist/output/public`
   - 环境变量：`CF_PAGES=1`
3. 绑定 D1 数据库（已在 `wrangler.toml` 中配置）

**优点**：
- **零 CI 配置**，Cloudflare 直连 GitHub，push 即部署
- **免费额度充足**：Pages 500 次/月构建，D1 免费额度 5GB 读 + 5M 行写
- **全球 CDN**，访问速度快
- **Preview 部署**：每个 PR 自动生成预览 URL
- 不需要自己的服务器

**缺点**：
- Cloudflare Workers 有运行时限制（CPU 10ms/请求，付费版 30ms）
- 抓取大量外部源可能超时（Workers 有 30 秒限制）
- D1 数据库单次查询有大小限制
- 部分需要代理抓取的源（国外站点）在 Cloudflare 边缘可能无法访问
- 不如自有服务器灵活（无法自定义系统级配置）

**适用场景**：面向国际用户的轻量部署、不想运维服务器、免费方案

---

### 方案 C：混合方案（推荐）

**原理**：Docker 部署自建服务器 + Cloudflare Pages 部署 CDN 版本，两者并存

```
开发者  ──tag v*──▶  GitHub Actions
                       │
                       ├─▶ Job 1: Docker 镜像构建
                       │   推送 ghcr.io
                       │   SSH 部署到自建服务器
                       │   （主服务，国内用户）
                       │
                       ├─▶ Job 2: Cloudflare Pages 部署
                       │   wrangler pages deploy
                       │   （CDN 版本，国际用户）
                       │
                       └─▶ Job 3: Release Notes
                           changelogithub 自动生成
```

**需要的 GitHub Secrets**：
| Secret | 说明 |
|--------|------|
| `SERVER_HOST` | 服务器 IP |
| `SERVER_USER` | SSH 用户名 |
| `SSH_PRIVATE_KEY` | SSH 私钥 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |

**优点**：
- 两个部署独立，互为备份
- 自建服务器走国内线路，适合抓取国内源（微博、知乎等）
- Cloudflare 走全球 CDN，适合国际用户访问国际源
- 一个 tag 触发全部部署，操作简单

**缺点**：
- 配置最复杂，需要同时维护两套环境
- 两份数据库（SQLite + D1），数据不共享
- 需要管理更多 Secrets

**适用场景**：同时服务国内外用户、追求高可用

---

### 方案 D：纯 Docker Compose + Watchtower 自动更新

**原理**：CI 只负责推镜像到 GHCR，服务器上用 Watchtower 自动检测并拉取新镜像

```
开发者  ──tag v*──▶  GitHub Actions
                       │
                       └─▶ 构建 + 推送 ghcr.io
                           标签: latest

自建服务器:
  Watchtower 容器（定时轮询）
       │
       └─▶ 检测到 ghcr.io 有新 latest
           自动 pull + 重启 omnitrends 容器
```

**docker-compose.yml 改动**：
```yaml
services:
  omnitrends:
    image: ghcr.io/tutoupower/omni_trends:latest
    # ... 现有配置不变

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=300  # 5分钟检查一次
      - WATCHTOWER_LABEL_ENABLE=true  # 只监控带标签的容器
```

**优点**：
- 服务器端零配置 SSH，不需要在 CI 里管理 SSH 密钥
- Watchtower 自动检测更新，延迟通常在几分钟内
- 安全性更好：CI 不需要服务器的 SSH 访问权限
- 回滚：手动 `docker compose` 指定旧版本

**缺点**：
- 更新不是实时的（有轮询间隔）
- 需要在服务器额外运行 Watchtower 容器
- 镜像必须用 `latest` 标签才能自动检测

**适用场景**：不想在 CI 中管理 SSH 密钥、接受几分钟的更新延迟

---

## 八、方案对比总结

| 维度 | A: Docker+SSH | B: CF Pages | C: 混合方案 | D: Watchtower |
|------|:---:|:---:|:---:|:---:|
| **配置复杂度** | 中 | 低 | 高 | 低 |
| **运维成本** | 中 | 无 | 高 | 低 |
| **费用** | 服务器费用 | 免费额度内 | 两者之和 | 服务器费用 |
| **部署速度** | ~3min | ~2min | ~5min | ~8min |
| **更新方式** | tag 触发 | push 自动 | tag 触发 | 自动轮询 |
| **国内访问** | 看服务器位置 | 需自选路线 | 好 | 看服务器位置 |
| **国际访问** | 看服务器位置 | 全球 CDN | 好 | 看服务器位置 |
| **回滚难度** | 低 | 低 | 中 | 低 |
| **超时风险** | 无 | 有（Workers 限制） | 无 | 无 |
| **抓取国外源** | 可配代理 | 边缘网络直连 | 两者互补 | 可配代理 |

---

## 九、建议

**如果主要面向国内用户**：方案 A（Docker + SSH），自建服务器稳定可控，抓取国内外源都不受限。

**如果追求最省事**：方案 B（Cloudflare Pages），零运维，push 代码就部署。

**如果要兼顾国内外**：方案 C（混合），但配置成本最高。

**如果不想管理 SSH 密钥**：方案 D（Watchtower），CI 只推镜像，服务器自动拉取。

当前项目已有完整的 Docker workflow 和 Cloudflare 配置，方案 A 或 B 都可以快速落地。建议先选定一个主力方案，后续再考虑扩展。
