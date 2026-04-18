interface IfanrItem {
  id: number
  post_title: string
  post_content: string
  created_at: number
  like_count: number
  comment_count: number
  buzz_original_url?: string
  post_id: string
}

interface IfanrResponse {
  objects: IfanrItem[]
}

export default defineSource(async () => {
  const url = "https://sso.ifanr.com/api/v5/wp/buzz/?limit=20&offset=0"
  const res: IfanrResponse = await myFetch(url, { responseType: "json" })
  return res.objects.map(v => ({
    id: String(v.id),
    title: v.post_title,
    url: v.buzz_original_url || `https://www.ifanr.com/${v.post_id}`,
    extra: {
      hover: v.post_content?.replace(/<[^>]*>/g, "").slice(0, 100),
      date: v.created_at * 1000,
    },
  }))
})
