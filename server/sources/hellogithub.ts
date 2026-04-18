interface HelloGithubItem {
  item_id: string
  title: string
  summary: string
  author: string
  updated_at: string
  clicks_total: number
}

interface HelloGithubResponse {
  data: HelloGithubItem[]
}

export default defineSource(async () => {
  const url = "https://abroad.hellogithub.com/v1/?sort_by=featured&tid=&page=1"
  const res: HelloGithubResponse = await myFetch(url)

  return res.data.map(v => ({
    id: v.item_id,
    title: v.title,
    url: `https://hellogithub.com/repository/${v.item_id}`,
    extra: {
      hover: v.summary,
      date: v.updated_at,
    },
  }))
})
