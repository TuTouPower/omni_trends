interface CsdnItem {
  productId: string
  articleTitle: string
  picList?: string[]
  nickName: string
  period: string
  hotRankScore: number
  articleDetailUrl: string
}

interface CsdnResponse {
  data: CsdnItem[]
}

export default defineSource(async () => {
  const url = "https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30"
  const res: CsdnResponse = await myFetch(url, {
    responseType: "json",
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Referer": "https://blog.csdn.net/",
      "Accept": "application/json",
    },
  })

  return res.data.map(v => ({
    id: v.productId,
    title: v.articleTitle,
    url: v.articleDetailUrl,
    extra: {
      info: `${v.nickName} · ${v.hotRankScore}`,
    },
  }))
})
