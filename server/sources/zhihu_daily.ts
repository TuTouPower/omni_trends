interface ZhihuDailyStory {
  id: string
  title: string
  hint: string
  type: number
  url: string
}

interface ZhihuDailyResponse {
  stories: ZhihuDailyStory[]
}

const zhihuDaily = defineSource(async () => {
  const url = "https://daily.zhihu.com/api/4/news/latest"
  const res: ZhihuDailyResponse = await myFetch(url, {
    headers: {
      Referer: "https://daily.zhihu.com/api/4/news/latest",
      Host: "daily.zhihu.com",
    },
  })
  return res.stories
    .filter(el => el.type === 0)
    .map(v => ({
      id: v.id,
      title: v.title,
      url: v.url,
      extra: {
        info: v.hint,
      },
    }))
})

export default defineSource({
  "zhihu-daily": zhihuDaily,
})
