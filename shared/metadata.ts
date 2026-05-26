import { sources } from "./sources"
import { typeSafeObjectEntries, typeSafeObjectFromEntries } from "./type.util"
import type { ColumnID, HiddenColumnID, Metadata, SourceID } from "./types"

export const columns = {
  china: {
    zh: "国内",
  },
  world: {
    zh: "国际",
  },
  tech: {
    zh: "科技",
  },
  finance: {
    zh: "财经",
  },
  focus: {
    zh: "关注",
  },
  realtime: {
    zh: "实时",
  },
  hottest: {
    zh: "最热",
  },
} as const

export const fixedColumnIds = ["focus", "hottest", "realtime"] as const satisfies Partial<ColumnID>[]
export const hiddenColumns = Object.keys(columns).filter(id => !fixedColumnIds.includes(id as any)) as HiddenColumnID[]

export const metadata: Metadata = typeSafeObjectFromEntries(typeSafeObjectEntries(columns).map(([k, v]) => {
  switch (k) {
    case "focus":
      return [k, {
        name: v.zh,
        sources: [] as SourceID[],
      }]
    case "hottest":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "hottest" && !v.redirect).map(([k]) => k),
      }]
    case "realtime":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "realtime" && !v.redirect).map(([k]) => k),
      }]
    default:
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.column === k && !v.redirect).map(([k]) => k),
      }]
  }
}))

export const hottestOrderZh: SourceID[] = [
  "douyin",
  "xiaohongshu",
  "weibo",
  "zhihu",
  "bilibili-hot-search",
  "baidu",
  "toutiao",
  "tencent-hot",
  "hupu",
  "tieba",
  "douban",
  "sina",
  "kuaishou",
  "nowcoder",
  "thepaper",
  "ifeng",
  "netease-news",
  "qq-news",
  "acfun",
  "newsmth",
  "huxiu",
  "sspai",
  "juejin",
  "csdn",
  "segmentfault",
  "ngabbs",
  "coolapk",
  "pcbeta",
  "52pojie",
  "nodeseek",
  "freebuf",
  "qqvideo",
  "iqiyi",
  "weread",
  "netease-music",
  "github",
  "hackernews",
  "producthunt",
  "xueqiu",
  "stcn",
  "reddit",
  "steam",
  "huggingface",
]

export const hottestOrderEn: SourceID[] = [
  // Western mainstream — most recognizable to English users
  "reddit",
  "github",
  // Chinese mega-platforms — high global awareness
  "weibo",
  "douyin",
  "zhihu",
  "xiaohongshu",
  "bilibili-hot-search",
  "baidu",
  "toutiao",
  "tencent-hot",
  "thepaper",
  "ifeng",
  "sina",
  "netease-news",
  "qq-news",
  "douban",
  "hupu",
  "kuaishou",
  "tieba",
  // Tech communities — niche but some Western users know them
  "hackernews",
  "producthunt",
  "huxiu",
  "sspai",
  "juejin",
  "csdn",
  "segmentfault",
  "huggingface",
  "coolapk",
  "ngabbs",
  "freebuf",
  // Finance
  "xueqiu",
  "stcn",
  "cls",
  "wallstreetcn",
  // Entertainment & niche
  "nowcoder",
  "qqvideo",
  "iqiyi",
  "weread",
  "netease-music",
  "acfun",
  "newsmth",
  "steam",
  "chongbuluo",
  "pcbeta",
  "52pojie",
  "nodeseek",
]
