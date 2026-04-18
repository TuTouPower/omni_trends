interface RedditItem {
  data: {
    title: string
    permalink: string
    score: number
    num_comments: number
    created_utc: number
    thumbnail: string
  }
}

interface RedditListing {
  data: {
    children: RedditItem[]
    dist: number
  }
}

async function fetchReddit(path: string) {
  const res = await myFetch<RedditListing>(`https://www.reddit.com${path}`, {
    headers: {
      "User-Agent": "newsnow-bot/1.0",
    },
  })
  return res.data.children
    .filter((c: RedditItem) => !c.data.thumbnail?.startsWith("nsfw"))
    .map((c: RedditItem) => ({
      id: c.data.permalink,
      title: c.data.title,
      url: `https://www.reddit.com${c.data.permalink}`,
      extra: {
        info: `${c.data.score} pts · ${c.data.num_comments} comments`,
      },
    }))
}

const hot = defineSource(() => fetchReddit("/hot.json?limit=30"))
const worldnews = defineSource(() =>
  fetchReddit("/r/worldnews/hot.json?limit=30"),
)

export default defineSource({
  "reddit": hot,
  "reddit-hot": hot,
  "reddit-worldnews": worldnews,
})
