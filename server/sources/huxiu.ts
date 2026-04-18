interface HuxiuItem {
  content: string
  object_id: number
  user_info?: {
    username: string
  }
  publish_time: number
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
    responseType: "json",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://www.huxiu.com/moment/",
    },
  })
  const list = res.data?.moment_list?.datalist || []
  return list.map((v) => {
    const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n")
    const lines = content
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean)
    const title = lines[0]?.replace(/。$/, "") || ""
    const intro = lines.slice(1).join("\n")
    const momentId = String(v.object_id)
    return {
      id: momentId,
      title,
      url: `https://www.huxiu.com/moment/${momentId}.html`,
      extra: {
        info: v.user_info?.username || "",
        hover: intro,
        date: v.publish_time * 1000,
      },
    }
  })
})
