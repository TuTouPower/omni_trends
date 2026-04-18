interface DgtleItem {
  id: string
  title: string
  content: string
  cover: string
  from: string
  membernum: number
  created_at: string
  type: string
}

interface DgtleResponse {
  items: DgtleItem[]
}

export default defineSource(async () => {
  const url = "https://opser.api.dgtle.com/v2/news/index"
  const res: DgtleResponse = await myFetch(url)

  return res.items.map(v => ({
    id: v.id,
    title: v.title || v.content,
    url: `https://www.dgtle.com/news-${v.id}-${v.type}.html`,
    extra: {
      info: v.from,
      hover: v.content,
      icon: v.cover,
      date: v.created_at,
    },
  }))
})
