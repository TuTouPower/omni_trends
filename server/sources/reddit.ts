import type { NewsItem } from "@shared/types"

async function fetchRedditRss(path: string): Promise<NewsItem[]> {
  const rssUrl = `https://old.reddit.com${path}.rss`
  const data = await rss2json(rssUrl)
  if (!data?.items.length) throw new Error("Cannot fetch reddit RSS")
  return data.items
    .filter(item => item?.title && item?.link)
    .map(item => ({
      id: item.link,
      title: item.title,
      url: item.link,
      pubDate: item.created,
    }))
}

const hot = defineSource(() => fetchRedditRss("/hot"))
const worldnews = defineSource(() => fetchRedditRss("/r/worldnews/hot"))

export default defineSource({
  "reddit": hot,
  "reddit-hot": hot,
  "reddit-worldnews": worldnews,
})
