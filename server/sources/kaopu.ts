type Res = {
  description: string
  link: string
  // Date
  pub_date: string
  publisher: string
  title: string
}[]
export default defineSource(async () => {
  const res: Res = await $fetch("https://kaopustorage.blob.core.windows.net/news-prod/news_list_hans_0.json")
  return res.filter(k => ["财新", "公视"].every(h => k.publisher !== h)).map((k) => {
    return {
      id: k.link,
      title: k.title,
      pubDate: k.pub_date,
      extra: {
        hover: k.description,
        info: k.publisher,
      },
      url: k.link,
    }
  })
},
)
