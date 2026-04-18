interface GuokrItem {
  id: string
  title: string
  summary: string
  date_modified: string
  author?: {
    nickname: string
  }
}

export default defineSource(async () => {
  const url = "https://www.guokr.com/beta/proxy/science_api/articles?limit=30"
  const res: GuokrItem[] = await myFetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
    },
  })
  return res.map(v => ({
    id: v.id,
    title: v.title,
    url: `https://www.guokr.com/article/${v.id}`,
    extra: {
      info: v.author?.nickname,
      hover: v.summary,
      date: parseRelativeDate(v.date_modified, "Asia/Shanghai").valueOf(),
    },
  }))
})
