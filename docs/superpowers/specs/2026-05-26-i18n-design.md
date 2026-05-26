# i18n 国际化设计 Spec

> 日期：2026-05-26
> 状态：Draft

## 概述

为 OmniTrends（热榜聚合）添加中英文国际化支持：

- 右上角紧凑 pill 按钮切换中/EN
- 默认读取系统语言（`navigator.language`）
- 所有 UI 文本、栏目名、数据源小标题随语言切换
- "最热"栏目维护两套手动预设排序，英文模式下国际平台优先
- 数据源名称保持原样不翻译（抖音、微博、GitHub 等）

## 技术方案

### 依赖

```
i18next
react-i18next
```

### 文件变更

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/i18n.ts` | i18next 初始化 |
| 新建 | `src/hooks/useLang.ts` | 语言偏好 hook（读 i18next.language） |
| 新建 | `src/locales/zh.json` | 中文翻译字典 |
| 新建 | `src/locales/en.json` | 英文翻译字典 |
| 新建 | `src/components/header/lang-toggle.tsx` | 语言切换 pill 按钮 |
| 修改 | `src/main.tsx` | import i18n.ts |
| 修改 | `src/components/header/index.tsx` | 添加 LangToggle、logo 区双语 |
| 修改 | `src/components/navbar.tsx` | "更多" → t() |
| 修改 | `src/components/header/menu.tsx` | 菜单文本 → t() |
| 修改 | `src/components/common/search-bar/index.tsx` | 搜索文本 + 分组名 → t() |
| 修改 | `src/components/column/dnd.tsx` | "拖拽中" → t() |
| 修改 | `src/components/column/index.tsx` | 页面标题 → t() |
| 修改 | `shared/metadata.ts` | 添加最热排序数组 |

### 架构

```
src/i18n.ts
  import i18n from "i18next"
  import { initReactI18next } from "react-i18next"
  import zh from "./locales/zh.json"
  import en from "./locales/en.json"

  i18n.use(initReactI18next).init({
    resources: { zh: { translation: zh }, en: { translation: en } },
    lng: detectLang(),   // navigator.language.startsWith("zh") ? "zh" : "en"
    fallbackLng: "zh",
    interpolation: { escapeValue: false },
  })
```

```
src/hooks/useLang.ts
  type Lang = "zh" | "en"

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

**语言状态单一事实源：** `i18next.language`。不创建额外 Jotai atom。UI 文本、最热排序、语言按钮都读同一个来源。持久化由 i18next `languageChanged` 事件写 localStorage 负责。

初始化时：`main.tsx` 中 `import "./i18n"` 放在最前面，确保 i18next 在 React 渲染前就绪。

## 翻译字典

### 栏目名

栏目名翻译全部走 i18next 字典，key 为 `column.{id}`。`shared/metadata.ts` 中的 `columns` 对象保持原样（仅 `zh` 字段），不做修改。

前端显示时用 `t("column.{id}")` 替代 `metadata[id].name`。

### UI 文本（zh.json / en.json）

```jsonc
// zh.json
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

// en.json
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

### 数据源小标题翻译

在 i18n 字典中，key 为 `source.title.{id}`，仅翻译有 title 的源：

```jsonc
// en.json 中追加
{
  "source.title.weibo": "Trending",
  "source.title.bilibili-hot-search": "Hot Search",
  "source.title.bilibili-hot-video": "Popular Videos",
  "source.title.bilibili-ranking": "Ranking",
  "source.title.tencent-hot": "Morning Brief",
  "source.title.hupu": "Hot Threads",
  "source.title.tieba": "Hot Discussion",
  "source.title.douban": "Popular Movies",
  "source.title.kuaishou": "Trending",
  "source.title.36kr-quick": "Flash News",
  "source.title.thepaper": "Trending",
  "source.title.ifeng": "Hot News",
  "source.title.cls": "Flash",
  "source.title.xueqiu": "Hot Stocks",
  "source.title.wallstreetcn": "Flash",
  "source.title.stcn": "Hot",
  "source.title.reddit": "Hot",
  "source.title.github": "Today",
  "source.title.steam": "Online Players",
  "source.title.freebuf": "Cybersecurity",
  "source.title.qqvideo": "Hot Search",
  "source.title.iqiyi": "Popular",
  "source.title.v2ex": "Latest",
  "source.title.coolapk": "Today",
  "source.title.pcbeta": "Win11",
  "source.title.gelonghui": "Events",
  "source.title.fastbull": "Flash",
  "source.title.chongbuluo": "Latest",
  "source.title.nytimes": "Chinese",
  "source.title.miyoushe": "Genshin"
}
```

zh.json 中这些 key 不需要，fallback 到 `pre-sources.ts` 中的原始 title 值。

## "最热"栏目双排序

### 实现方式

在 `shared/metadata.ts` 中维护两套排序数组：

```ts
// 中文模式排序（当前顺序，保持不变）
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

// 英文模式排序（国际平台优先）
export const hottestOrderEn: SourceID[] = [
  // International tech & dev
  "github", "hackernews", "producthunt", "reddit",
  // Chinese mega-platforms
  "weibo", "zhihu", "bilibili-hot-search", "douyin", "xiaohongshu",
  // Tech communities
  "v2ex", "coolapk", "segmentfault", "huggingface",
  "sspai", "juejin", "csdn", "ngabbs", "pcbeta", "52pojie", "nodeseek",
  "huxiu", "freebuf",
  // Chinese news & content
  "baidu", "toutiao", "sina", "thepaper", "ifeng",
  "netease-news", "qq-news", "tencent-hot",
  // Social & entertainment
  "hupu", "tieba", "douban", "acfun", "newsmth",
  "nowcoder", "kuaishou",
  "qqvideo", "iqiyi", "weread", "netease-music",
  // Finance
  "xueqiu", "stcn", "steam",
]
```

### 排序逻辑

`metadata.ts` 构建 `hottest` 列表时，当前无法感知语言（shared 层不依赖 React）。

**方案：** metadata 保持当前逻辑（按 pre-sources 定义顺序）。前端 `src/components/column/dnd.tsx` 中，根据当前语言对 `hottest` 列的 items 重新排序：

```ts
// dnd.tsx 中
const { i18n } = useTranslation()
const rawItems = useAtomValue(currentSourcesAtom)

const sortedItems = useMemo(() => {
  if (currentColumnID !== "hottest") return rawItems
  const order = i18n.language === "en" ? hottestOrderEn : hottestOrderZh
  return [...rawItems].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}, [rawItems, i18n.language, currentColumnID])
```

切换语言时，"最热"栏目自动按对应预设重排。其他栏目不受影响。

## UI 变更

### Header

**Logo 区：**

```tsx
// header/index.tsx
const { lang } = useLang()

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
```

**语言切换按钮（右上角，Menu 按钮左侧）：**

```tsx
// src/components/header/lang-toggle.tsx
function LangToggle() {
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

Header 右侧按钮顺序：`GoTop · Refresh · Github · LangToggle · Menu`

### NavBar

```tsx
// navbar.tsx
<button onClick={() => toggle(true)}>
  {t("nav.more")}
</button>
// ...
{metadata[columnId].name} → {t(`column.${columnId}`)}
```

### Menu

```tsx
// menu.tsx
{isDark ? t("menu.lightMode") : t("menu.darkMode")}
{t("menu.logout")}
{t("menu.login")}
{t("menu.star")}
```

### SearchBar

```tsx
// search-bar/index.tsx
// 分组名使用 translated column name
column: source.column ? t(`column.${source.column}`) : t("search.uncategorized")

// 分组排序用 translated name 比较
// （用 column key 排序而非翻译后的文字）

// placeholder 和 empty text
<Command.Input placeholder={t("search.placeholder")} />
<Command.Empty>{t("search.empty")}</Command.Empty>
```

搜索栏分组排序逻辑中，硬编码的 `"科技"` / `"未分类"` 改为用 column key 排序：

```ts
function groupByColumn(items) {
  // ...
  .sort((m, n) => {
    // 用原始 column key 排序，不用翻译后的文字
    const mKey = /* m 的 column key */ 
    const nKey = /* n 的 column key */
    if (mKey === "tech") return -1
    if (nKey === "tech") return 1
    if (!mKey) return 1    // uncategorized last
    if (!nKey) return -1
    return mKey < nKey ? -1 : 1
  })
}
```

### DnD

```tsx
// dnd.tsx CardOverlay
<span className="text-xs op-70">{t("dnd.dragging")}</span>
```

### Column 页面标题

```tsx
// column/index.tsx
useTitle(t("title.page", { name: t(`column.${id}`) }))
```

### 数据源小标题

在 card.tsx 的 CardOverlay 和 NewsCard 中，显示 `sources[id].title` 时：

```tsx
// 优先用 i18n 翻译，fallback 到原始 title
const title = t(`source.title.${id}`, { defaultValue: sources[id].title })
```

## 行为规范

| 场景 | 行为 |
|------|------|
| 首次访问 | 读 `navigator.language`，中文 → zh，其他 → en |
| 手动切换 | 调用 `i18n.changeLanguage()`，i18next 自动持久化到 localStorage，立即生效 |
| 刷新页面 | i18next 从 localStorage 读取，保持用户选择 |
| "最热"栏目 | 切换语言时按预设重排，用户手动拖拽的顺序被覆盖 |
| 其他栏目 | 不受语言切换影响，保持用户拖拽顺序 |
| 数据源名称 | 永远不翻译，保持原样 |
| 未翻译的 title | fallback 到 pre-sources.ts 中的原始值（`defaultValue`） |

## React Hooks 使用规则

- React 组件和 custom hook 顶层可以调用 `useTranslation()`
- `useSync`、`useRefetch`、`usePWA` 都是 custom hook，`useTranslation()` 在顶层调用合法
- 普通函数、模块顶层、异步 callback 内不要调用 hook，用 `i18n.t()` 代替
- 非 React 上下文（如 `relativeTimeI18n`）直接用 `i18n.t.bind(i18n)`

## 语言按钮可访问性

- 按钮必须用 `<button>` 元素（不是 `<span>`）
- `aria-label`：中文模式下 `"Switch to English"`，英文模式下 `"切换到中文"`
- `title`：中文模式下 `"English"`，英文模式下 `"中文"`
- Tab 可聚焦，Enter/Space 可触发（原生 button 行为）
- 短文本 "中/EN" 不是唯一语义，`aria-label` 提供完整描述

## 实施顺序

1. 安装依赖：`pnpm add i18next react-i18next`
2. 创建 `src/i18n.ts` + `src/hooks/useLang.ts`
3. 创建 `src/locales/zh.json` + `src/locales/en.json`
4. 创建 `src/locales/zh.json` + `src/locales/en.json`
5. 创建 `src/components/header/lang-toggle.tsx`
6. 修改 `src/main.tsx`（import i18n）
7. 修改 `src/components/header/index.tsx`（logo + LangToggle）
8. 逐个修改组件：navbar → menu → search-bar → dnd → card → column/index
9. 在 dnd.tsx 中实现最热栏目双排序
10. 构建验证：`pnpm build`
