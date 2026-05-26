# i18n 国际化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 OmniTrends 添加中英文国际化支持，包括语言切换、UI 文本翻译、最热栏目双排序。

**Architecture:** i18next + react-i18next 管理翻译。`i18next.language` 为语言状态唯一事实源，`useLang()` hook 读取 `i18n.language` 并通过 `i18n.changeLanguage()` 切换。i18next 自身负责 localStorage 持久化。最热栏目维护两套手动预设排序。

**Tech Stack:** i18next, react-i18next, UnoCSS

**Spec:** `docs/superpowers/specs/2026-05-26-i18n-design.md`

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 新建 | `src/i18n.ts` | i18next 初始化，语言检测 |
| 新建 | `src/hooks/useLang.ts` | 语言偏好 hook |
| 新建 | `src/locales/zh.json` | 中文翻译字典 |
| 新建 | `src/locales/en.json` | 英文翻译字典 |
| 新建 | `src/components/header/lang-toggle.tsx` | 语言切换 pill 按钮 |
| 修改 | `package.json` | 添加 i18next 依赖 |
| 修改 | `src/main.tsx:1` | import i18n.ts |
| 修改 | `src/hooks/useRelativeTime.ts` | relativeTime 改用 i18next 翻译 |
| 修改 | `src/components/header/index.tsx` | logo 双语 + LangToggle |
| 修改 | `src/components/navbar.tsx:22` | "更多" → t() |
| 修改 | `src/components/header/menu.tsx:9,58,64` | 菜单文本 → t() |
| 修改 | `src/components/common/search-bar/index.tsx:29-33,86,91` | 搜索文本 → t() |
| 修改 | `src/components/column/card.tsx:128,175-177` | 标题和状态文本 → t() |
| 修改 | `src/components/column/dnd.tsx:90,155` | 提示文本 → t() |
| 修改 | `src/components/column/index.tsx` | 页面标题 → t() |
| 修改 | `shared/metadata.ts` | 添加最热排序数组 |
| 修改 | `src/hooks/useSync.ts:51-54,76-79` | toast 消息 → t() |
| 修改 | `src/hooks/useRefetch.ts:13-16` | toast 消息 → t() |
| 修改 | `src/hooks/usePWA.ts:16-34` | toast 消息 → t() |

---

## Task 1: 安装依赖 + 创建 i18n 基础设施

**Files:**
- Modify: `package.json`
- Create: `src/i18n.ts`
- Create: `src/hooks/useLang.ts`
- Modify: `src/main.tsx:1`

- [ ] **Step 1: 安装依赖**

```bash
cd /home/karon/karson_ubuntu/omni_trends
pnpm add i18next react-i18next
```

- [ ] **Step 2: 创建 `src/i18n.ts`**

i18next 使用 `detection` 插件自动读写 localStorage，无需额外 atomWithStorage。

```ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zh from "./locales/zh.json"
import en from "./locales/en.json"

function detectLang(): "zh" | "en" {
  try {
    return navigator.language.startsWith("zh") ? "zh" : "en"
  } catch {
    return "zh"
  }
}

const savedLang = (() => {
  try {
    return localStorage.getItem("lang") as "zh" | "en" | null
  } catch {
    return null
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: savedLang || detectLang(),
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
  // 切换语言时自动存 localStorage
  saveMissing: false,
})

// 持久化：切换时写 localStorage
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("lang", lng)
  } catch {}
})

export default i18n
```

- [ ] **Step 3: 创建 `src/hooks/useLang.ts`**

语言状态唯一事实源是 `i18n.language`。不使用 atomWithStorage，避免双源不同步。

```ts
import i18n from "~/i18n"

export type Lang = "zh" | "en"

export function useLang() {
  const [lang, setLangState] = useState<Lang>(i18n.language as Lang)

  useEffect(() => {
    const handler = (lng: string) => setLangState(lng as Lang)
    i18n.on("languageChanged", handler)
    return () => i18n.off("languageChanged", handler)
  }, [])

  const setLang = useCallback((l: Lang) => {
    i18n.changeLanguage(l)
  }, [])

  return { lang, setLang }
}
```

注：`useState`, `useEffect`, `useCallback` 均由 unimport 自动导入。

- [ ] **Step 4: 修改 `src/main.tsx` — 在顶部 import i18n**

在 `import ReactDOM` 之前加一行：

```tsx
import "./i18n"
import ReactDOM from "react-dom/client"
// ... rest unchanged
```

---

## Task 2: 创建翻译字典

**Files:**
- Create: `src/locales/zh.json`
- Create: `src/locales/en.json`

- [ ] **Step 1: 创建 `src/locales/zh.json`**

```json
{
  "column.china": "国内",
  "column.world": "国际",
  "column.tech": "科技",
  "column.finance": "财经",
  "column.focus": "关注",
  "column.realtime": "实时",
  "column.hottest": "最热",
  "nav.more": "更多",
  "menu.lightMode": "浅色模式",
  "menu.darkMode": "深色模式",
  "menu.logout": "退出登录",
  "menu.login": "Github 账号登录",
  "menu.star": "Star on Github",
  "search.placeholder": "搜索你想要的",
  "search.empty": "没有找到，可以前往 Github 提 issue",
  "search.uncategorized": "未分类",
  "dnd.dragging": "拖拽中",
  "dnd.swipeHint": "左右滑动查看更多",
  "status.updated": "{{time}}更新",
  "status.failed": "获取失败",
  "status.loading": "加载中...",
  "toast.syncFail": "身份校验失败，无法同步，请重新登录",
  "toast.login": "登录",
  "toast.forceRefresh": "登录后可以强制拉取最新数据",
  "toast.updateSuccess": "更新成功，赶快体验吧",
  "toast.viewUpdate": "查看更新",
  "toast.updateAvailable": "有更新，5 秒后自动更新",
  "toast.updateNow": "立刻更新",
  "time.justNow": "刚刚",
  "time.minutesAgo": "{{count}}分钟前",
  "time.hoursAgo": "{{count}}小时前",
  "time.date": "{{month}}月{{day}}日",
  "title.site": "热榜聚合",
  "title.page": "OmniTrends | {{name}}"
}
```

- [ ] **Step 2: 创建 `src/locales/en.json`**

```json
{
  "column.china": "China",
  "column.world": "World",
  "column.tech": "Tech",
  "column.finance": "Finance",
  "column.focus": "Focus",
  "column.realtime": "Realtime",
  "column.hottest": "Hottest",
  "nav.more": "More",
  "menu.lightMode": "Light Mode",
  "menu.darkMode": "Dark Mode",
  "menu.logout": "Logout",
  "menu.login": "Sign in with Github",
  "menu.star": "Star on Github",
  "search.placeholder": "Search sources...",
  "search.empty": "Not found. Open an issue on Github.",
  "search.uncategorized": "Uncategorized",
  "dnd.dragging": "Dragging",
  "dnd.swipeHint": "Swipe to see more",
  "status.updated": "{{time}} ago",
  "status.failed": "Failed",
  "status.loading": "Loading...",
  "toast.syncFail": "Auth failed, cannot sync. Please sign in again.",
  "toast.login": "Sign in",
  "toast.forceRefresh": "Sign in to force refresh latest data",
  "toast.updateSuccess": "Update successful! Enjoy the new version.",
  "toast.viewUpdate": "View update",
  "toast.updateAvailable": "Update available, auto-updating in 5s",
  "toast.updateNow": "Update now",
  "time.justNow": "Just now",
  "time.minutesAgo": "{{count}}min ago",
  "time.hoursAgo": "{{count}}h ago",
  "time.date": "{{month}}/{{day}}",
  "title.site": "Hot Aggregator",
  "title.page": "OmniTrends | {{name}}"
}
```

---

## Task 3: i18n-aware 相对时间

**Files:**
- Modify: `src/hooks/useRelativeTime.ts`

- [ ] **Step 1: 修改 `src/hooks/useRelativeTime.ts`**

在文件中新增 `relativeTimeI18n` 函数，使用 i18n.t() 翻译时间。`useRelativeTime` hook 内部改用新函数。旧的 `relativeTime` 函数（在 `shared/utils.ts`）保持不动，供非前端代码使用。

```ts
// 在现有文件中，新增以下函数（保留 timerAtom、useVisibility 不动）：

import i18n from "~/i18n"

function relativeTimeI18n(timestamp: string | number): string | undefined {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  if (Number.isNaN(date.getDay())) return undefined

  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60

  const t = i18n.t.bind(i18n)

  if (diffInSeconds < 60) {
    return t("time.justNow")
  } else if (diffInMinutes < 60) {
    return t("time.minutesAgo", { count: Math.floor(diffInMinutes) })
  } else if (diffInHours < 24) {
    return t("time.hoursAgo", { count: Math.floor(diffInHours) })
  } else {
    return t("time.date", { month: date.getMonth() + 1, day: date.getDate() })
  }
}
```

修改 `useRelativeTime` hook，将内部的 `relativeTime(timestamp)` 调用改为 `relativeTimeI18n(timestamp)`：

```ts
export function useRelativeTime(timestamp: string | number) {
  const [time, setTime] = useState<string>()
  const timer = useAtomValue(timerAtom)
  const visible = useVisibility()

  useEffect(() => {
    if (visible) {
      const t = relativeTimeI18n(timestamp)
      if (t) setTime(t)
    }
  }, [timestamp, timer, visible])

  return time
}
```

注：`shared/utils.ts` 中的 `relativeTime` 函数不改，保持原样。

---

## Task 4: Header 组件

**Files:**
- Create: `src/components/header/lang-toggle.tsx`
- Modify: `src/components/header/index.tsx`

- [ ] **Step 1: 创建 `src/components/header/lang-toggle.tsx`**

```tsx
import { useTranslation } from "react-i18next"
import { useLang } from "~/hooks/useLang"

export function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <button
      type="button"
      aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
      title={lang === "zh" ? "English" : "中文"}
      className="inline-flex items-center bg-primary/10 rounded-full p-0.5 text-xs font-semibold cursor-pointer select-none"
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
    >
      <span className={$("px-2 py-0.5 rounded-full transition-colors", lang === "zh" && "bg-primary text-white")}>
        中
      </span>
      <span className={$("px-2 py-0.5 rounded-full transition-colors", lang === "en" && "bg-primary text-white")}>
        EN
      </span>
    </button>
  )
}
```

- [ ] **Step 2: 修改 `src/components/header/index.tsx`**

在文件顶部添加 import：

```tsx
import { useTranslation } from "react-i18next"
import { LangToggle } from "./lang-toggle"
```

修改 `Header` 组件：

```tsx
export function Header() {
  const { lang } = useLang()
  const { t } = useTranslation()

  return (
    <>
      <span className="flex justify-self-start">
        <Link to="/" className="flex gap-2 items-center">
          <div className="h-10 w-10 bg-cover bg-center rounded" title="logo" style={{ backgroundImage: "url(/favicon.png)" }} />
          <span className="text-2xl font-brand line-height-none!">
            <p>Omni</p>
            <p className="mt--1">
              <span className="color-primary-6">T</span>
              <span>rends</span>
              {lang === "zh" && (
                <span className="text-sm text-neutral-400 ml-2 tracking-widest">{t("title.site")}</span>
              )}
            </p>
          </span>
        </Link>
      </span>
      <span className="justify-self-center">
        <span className="hidden md:(inline-block)">
          <NavBar />
        </span>
      </span>
      <span className="justify-self-end flex gap-2 items-center text-xl text-primary-600 dark:text-primary">
        <GoTop />
        <Refresh />
        <Github />
        <LangToggle />
        <Menu />
      </span>
    </>
  )
}
```

---

## Task 5: NavBar + Menu 组件

**Files:**
- Modify: `src/components/navbar.tsx:22`
- Modify: `src/components/header/menu.tsx:9,58,64`

- [ ] **Step 1: 修改 `src/components/navbar.tsx`**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 NavBar 函数内添加：

```tsx
const { t } = useTranslation()
```

将 `"更多"` 改为 `{t("nav.more")}`。

将 `{metadata[columnId].name}` 改为 `{t(`column.${columnId}`)}`。

- [ ] **Step 2: 修改 `src/components/header/menu.tsx`**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `ThemeToggle` 函数内添加 `const { t } = useTranslation()`。

将：
- `{isDark ? "浅色模式" : "深色模式"}` → `{isDark ? t("menu.lightMode") : t("menu.darkMode")}`

在 `Menu` 函数内添加 `const { t } = useTranslation()`。

将：
- `退出登录` → `{t("menu.logout")}`
- `Github 账号登录` → `{t("menu.login")}`
- `Star on Github` → `{t("menu.star")}`

---

## Task 6: SearchBar 组件

**Files:**
- Modify: `src/components/common/search-bar/index.tsx:29-33,48,86,91`

- [ ] **Step 1: 修改搜索栏**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `SearchBar` 函数内添加 `const { t } = useTranslation()`。

修改 `SourceItemProps` 接口，增加 `columnName` 字段：

```tsx
interface SourceItemProps {
  id: SourceID
  name: string
  title?: string
  column: string | null
  columnName: string
  pinyin: string
}
```

将 `groupByColumn` 调用改为：

```tsx
const sourceItems = useMemo(
  () =>
    groupByColumn(typeSafeObjectEntries(sources)
      .filter(([_, source]) => !source.redirect)
      .map(([k, source]) => ({
        id: k,
        title: source.title ? t(`source.title.${k}`, { defaultValue: source.title }) : undefined,
        column: source.column || null,
        columnName: source.column ? t(`column.${source.column}`) : t("search.uncategorized"),
        name: source.name,
        pinyin: pinyin?.[k as keyof typeof pinyin] ?? "",
      })))
  , [t],
)
```

修改 `groupByColumn` 函数，用 column key 排序（不用翻译文本）：

```tsx
function groupByColumn(items: SourceItemProps[]) {
  return items.reduce((acc, item) => {
    const k = acc.find(i => i.column === item.column)
    if (k) k.sources = [...k.sources, item]
    else acc.push({ column: item.column, columnName: item.columnName, sources: [item] })
    return acc
  }, [] as {
    column: string | null
    columnName: string
    sources: SourceItemProps[]
  }[]).sort((m, n) => {
    if (m.column === "tech") return -1
    if (n.column === "tech") return 1
    if (!m.column) return 1
    if (!n.column) return -1
    return m.column < n.column ? -1 : 1
  })
}
```

修改渲染部分：

```tsx
<Command.Input placeholder={t("search.placeholder")} />
// ...
<Command.Empty>{t("search.empty")}</Command.Empty>
// ...
<Command.Group heading={columnName} key={column}>
```

---

## Task 7: Card + DnD + Column 组件

**Files:**
- Modify: `src/components/column/card.tsx:128,175-177`
- Modify: `src/components/column/dnd.tsx:90,155`
- Modify: `src/components/column/index.tsx`

- [ ] **Step 1: 修改 `card.tsx` — 源标题翻译 + 状态文本**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `NewsCard` 函数内添加 `const { t } = useTranslation()`。

将第 128 行的 source title 显示改为：

```tsx
{sources[id]?.title && <span className={$("text-sm", `color-${sources[id].color} bg-base op-80 bg-op-50! px-1 rounded`)}>{t(`source.title.${id}`, { defaultValue: sources[id].title })}</span>}
```

修改 `UpdatedTime` 组件：

```tsx
function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const { t } = useTranslation()
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return t("status.updated", { time: relativeTime })
  if (isError) return t("status.failed")
  return t("status.loading")
}
```

- [ ] **Step 2: 修改 `dnd.tsx` — 提示文本**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `Dnd` 函数内添加 `const { t } = useTranslation()`。

将第 90 行：

```tsx
<span className="text-sm text-gray-500 text-center">{t("dnd.swipeHint")}</span>
```

在 `CardOverlay` 函数内添加 `const { t } = useTranslation()`。

将第 155 行：

```tsx
<span className="text-xs op-70">{t("dnd.dragging")}</span>
```

- [ ] **Step 3: 修改 `column/index.tsx` — 页面标题**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `Column` 函数内添加 `const { t } = useTranslation()`。

将 `useTitle` 改为：

```tsx
useTitle(t("title.page", { name: t(`column.${id}`) }))
```

---

## Task 8: Toast 消息翻译（hooks）

**Files:**
- Modify: `src/hooks/useSync.ts:51-54,76-79`
- Modify: `src/hooks/useRefetch.ts:13-16`
- Modify: `src/hooks/usePWA.ts:16-34`

这些文件导出的都是 React custom hook，`useTranslation()` 在 hook 顶层调用，符合 React Hooks 规则。

- [ ] **Step 1: 修改 `useSync.ts`**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `useSync` 函数开头添加 `const { t } = useTranslation()`。

将两处 toast 调用改为：

```tsx
toaster(t("toast.syncFail"), {
  type: "error",
  action: {
    label: t("toast.login"),
    onClick: login,
  },
})
```

- [ ] **Step 2: 修改 `useRefetch.ts`**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `useRefetch` 函数开头添加 `const { t } = useTranslation()`。

将 toast 调用改为：

```tsx
toaster(t("toast.forceRefresh"), {
  type: "warning",
  action: {
    label: t("toast.login"),
    onClick: login,
  },
})
```

- [ ] **Step 3: 修改 `usePWA.ts`**

在文件顶部添加：

```tsx
import { useTranslation } from "react-i18next"
```

在 `usePWA` 函数开头添加 `const { t } = useTranslation()`。

将 toast 调用改为：

```tsx
// 更新成功
toaster(t("toast.updateSuccess"), {
  action: {
    label: t("toast.viewUpdate"),
    onClick: () => {
      window.open(`${Homepage}/releases/tag/v${Version}`)
    },
  },
})

// 有更新
toaster(t("toast.updateAvailable"), {
  action: {
    label: t("toast.updateNow"),
    onClick: update,
  },
  onDismiss: update,
})
```

---

## Task 9: 最热栏目双排序

**Files:**
- Modify: `shared/metadata.ts`（添加排序数组）
- Modify: `src/components/column/dnd.tsx`（应用排序）

- [ ] **Step 1: 在 `shared/metadata.ts` 末尾添加两个排序数组**

```ts
export const hottestOrderZh: SourceID[] = [
  "douyin", "xiaohongshu", "weibo", "zhihu",
  "bilibili-hot-search", "baidu", "toutiao",
  "tencent-hot", "hupu", "tieba", "douban", "sina",
  "kuaishou", "nowcoder", "thepaper", "ifeng",
  "netease-news", "qq-news", "acfun", "newsmth",
  "huxiu", "sspai", "juejin", "csdn", "segmentfault",
  "ngabbs", "coolapk", "pcbeta", "52pojie", "nodeseek",
  "freebuf", "qqvideo", "iqiyi", "weread", "netease-music",
  "github", "hackernews", "producthunt",
  "xueqiu", "stcn",
  "reddit", "steam",
  "huggingface",
]

export const hottestOrderEn: SourceID[] = [
  "github", "hackernews", "producthunt", "reddit",
  "weibo", "zhihu", "bilibili-hot-search", "douyin", "xiaohongshu",
  "v2ex", "coolapk", "segmentfault", "huggingface",
  "sspai", "juejin", "csdn", "ngabbs", "pcbeta", "52pojie", "nodeseek",
  "huxiu", "freebuf",
  "baidu", "toutiao", "sina", "thepaper", "ifeng",
  "netease-news", "qq-news", "tencent-hot",
  "hupu", "tieba", "douban", "acfun", "newsmth",
  "nowcoder", "kuaishou",
  "qqvideo", "iqiyi", "weread", "netease-music",
  "xueqiu", "stcn", "steam",
]
```

- [ ] **Step 2: 修改 `dnd.tsx` — 在 Dnd 函数中应用排序**

在文件顶部添加 import：

```tsx
import { useTranslation } from "react-i18next"
import { hottestOrderZh, hottestOrderEn } from "@shared/metadata"
```

在 `Dnd` 函数中，将原来的 `const [items, setItems] = useAtom(currentSourcesAtom)` 拆分：

```tsx
const { i18n } = useTranslation()
const [rawItems, setItems] = useAtom(currentSourcesAtom)

const items = useMemo(() => {
  if (currentColumnID !== "hottest") return rawItems
  const order = i18n.language === "en" ? hottestOrderEn : hottestOrderZh
  return [...rawItems].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}, [rawItems, i18n.language, currentColumnID])
```

`setItems` 继续用于拖拽更新。切换语言时排序会被预设覆盖，这是预期行为。

---

## Task 10: 构建与浏览器验证

- [ ] **Step 1: 运行构建**

```bash
cd /home/karon/karson_ubuntu/omni_trends
pnpm build
```

Expected: 构建成功，无 TypeScript 错误。

- [ ] **Step 2: 启动并手动验证**

```bash
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

浏览器打开 `http://localhost:20193/omni_trends`，逐项验证：

| # | 场景 | 预期 |
|---|------|------|
| 1 | 首次访问（系统语言中文） | 默认中文，显示"OmniTrends 热榜聚合" |
| 2 | 首次访问（系统语言英文） | 默认英文，仅显示"OmniTrends" |
| 3 | 点击"中/EN"切换到英文 | 所有 UI 文本变为英文 |
| 4 | 英文模式下"最热"栏目 | GitHub、HN、Product Hunt、Reddit 在前 |
| 5 | 英文模式下源小标题 | "Trending"、"Hot Search" 等英文 |
| 6 | 英文模式下未翻译 title | fallback 显示原始中文，不显示 key |
| 7 | 切换回中文 | 所有文本恢复中文，最热排序恢复 |
| 8 | 刷新页面 | 语言偏好保持（读 localStorage） |
| 9 | 英文模式下 toast | "Auth failed..." 等英文消息 |
| 10 | 英文模式下相对时间 | "3min ago"、"2h ago" 等英文格式 |
| 11 | 键盘 Tab 到语言按钮 | 可聚焦，aria-label 正确 |
| 12 | 搜索栏分组 | 按 column key 排序，标题已翻译 |

- [ ] **Step 3: 修复发现的问题（如有）**

构建或验证中发现的问题在此步骤修复。
