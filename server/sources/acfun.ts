interface AcfunItem {
  dougaId: string
  contentTitle: string
  contentDesc: string
  coverUrl: string
  userName: string
  contributeTime: string
  likeCount: number
}

interface AcfunResponse {
  rankList: AcfunItem[]
}

export default defineSource(async () => {
  const url = "https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=&rankLimit=30&rankPeriod=DAY"
  const res: AcfunResponse = await myFetch(url, {
    headers: {
      Referer: "https://www.acfun.cn/rank/list/?cid=-1&pcid=-1&range=DAY",
    },
  })

  return res.rankList.map(v => ({
    id: v.dougaId,
    title: v.contentTitle,
    url: `https://www.acfun.cn/v/ac${v.dougaId}`,
    extra: {
      info: `${v.userName} · ${v.likeCount}赞`,
      hover: v.contentDesc,
      icon: v.coverUrl,
      date: v.contributeTime,
    },
  }))
})
