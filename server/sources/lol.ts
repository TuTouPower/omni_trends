interface LolItem {
  iDocID: string
  sTitle: string
  sIMG: string
  sAuthor: string
  iTotalPlay: string
  sCreated: string
}

interface LolResponse {
  data: {
    result: LolItem[]
  }
}

export default defineSource(async () => {
  const url = "https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=json&page=1&num=30&target=24&source=web_pc"
  const res: LolResponse = await myFetch(url)

  return res.data.result.map(v => ({
    id: v.iDocID,
    title: v.sTitle,
    url: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`,
    extra: {
      info: v.sAuthor,
      date: v.sCreated,
    },
  }))
})
