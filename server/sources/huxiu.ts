interface HuxiuItem {
  content: string
  object_id: string
  user_info?: {
    username: string
  }
  publish_time: string
  count_info?: {
    agree_num: number
  }
}

interface HuxiuApiResponse {
  data?: {
    moment_list?: {
      datalist?: HuxiuItem[]
    }
  }
}

export default defineSource(async () => {
  const url = "https://moment-api.huxiu.com/web-v3/moment/feed?platform=www"
  const res: HuxiuApiResponse = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://www.huxiu.com/moment/",
    },
  })
  const list = res.data?.moment_list?.datalist || []
  return list.map((v) => {
    const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n")
    const [titleLine, ...rest] = content
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean)
    const title = titleLine?.replace(/。$/, "") || ""
    const intro = rest.join("\n")
    const momentId = v.object_id
    return {
      id: momentId,
      title,
      url: `https://www.huxiu.com/moment/${momentId}.html`,
      extra: {
        info: v.user_info?.username || "",
        hover: intro,
        date: parseRelativeDate(v.publish_time, "Asia/Shanghai").valueOf(),
      },
    }
  })
})
