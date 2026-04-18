interface NeteaseItem {
  docid: string
  title: string
  source: string
  ptime: string
}

interface NeteaseResponse {
  data: {
    list: NeteaseItem[]
  }
}

const neteaseNews = defineSource(async () => {
  const url = "https://m.163.com/fe/api/hot/news/flow"
  const res: NeteaseResponse = await myFetch(url)
  return res.data.list.map(v => ({
    id: v.docid,
    title: v.title,
    url: `https://www.163.com/dy/article/${v.docid}.html`,
    extra: {
      info: v.source,
      date: parseRelativeDate(v.ptime, "Asia/Shanghai").valueOf(),
    },
  }))
})

export default defineSource({
  "netease-news": neteaseNews,
})
