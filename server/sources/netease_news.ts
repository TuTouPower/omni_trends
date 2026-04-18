interface NeteaseItem {
  docid: string
  title: string
  source: string
  ptime: string
  url: string
}

interface NeteaseResponse {
  data: {
    list: NeteaseItem[]
  }
}

const neteaseNews = defineSource(async () => {
  const url = "https://m.163.com/fe/api/hot/news/flow"
  const res: NeteaseResponse = await myFetch(url, { responseType: "json" })
  return res.data.list.map(v => ({
    id: v.docid,
    title: v.title,
    url: v.url || `https://www.163.com/dy/article/${v.docid}.html`,
    extra: {
      info: v.source,
    },
  }))
})

export default defineSource({
  "netease-news": neteaseNews,
})
