interface HuggingfacePaper {
  id: string
  title: string
  paper: { url: string }
  publishedAt: string
  upvotes: number
}

export default defineSource(async () => {
  const data: HuggingfacePaper[] = await myFetch("https://huggingface.co/api/daily_papers", {
    responseType: "json",
  })
  return data.map(item => ({
    id: item.paper.url,
    title: item.title,
    url: `https://huggingface.co${item.paper.url}`,
    pubDate: item.publishedAt,
    extra: {
      info: `${item.upvotes} upvotes`,
    },
  }))
})
