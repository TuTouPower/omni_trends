interface SinaBase {
  uniqueId: string
  url: string
}

interface SinaInfo {
  title: string
  hotValue: string
}

interface SinaHotItem {
  base: {
    base: SinaBase
  }
  info: SinaInfo
}

interface SinaResponse {
  data: {
    hotList: SinaHotItem[]
  }
}

export default defineSource(async () => {
  const url = "https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-all"
  const res: SinaResponse = await myFetch(url)
  return res.data.hotList.map(v => ({
    id: v.base.base.uniqueId,
    title: v.info.title,
    url: v.base.base.url,
    extra: {
      info: v.info.hotValue,
    },
  }))
})
