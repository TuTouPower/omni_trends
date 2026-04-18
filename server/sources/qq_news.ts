interface QQNewsItem {
  id: string
  title: string
  abstract: string
  miniProShareImage: string
  source: string
  hotEvent: { hotScore: number }
  timestamp: number
}

interface QQNewsResponse {
  idlist: [{ newslist: QQNewsItem[] }]
}

const qqNews = defineSource(async () => {
  const url = "https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50"
  const res: QQNewsResponse = await myFetch(url)

  const list = res.idlist[0].newslist.slice(1)

  return list.map(v => ({
    id: v.id,
    title: v.title,
    url: `https://new.qq.com/rain/a/${v.id}`,
    extra: {
      info: `${v.source} · ${v.hotEvent.hotScore}热度`,
      hover: v.abstract,
      icon: v.miniProShareImage,
    },
  }))
})

export default defineSource({
  "qq-news": qqNews,
})
