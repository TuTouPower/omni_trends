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
    headers: {
      Referer: "https://blog.csdn.net/",
      Accept: "application/json",
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
