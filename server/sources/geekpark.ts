interface GeekparkPost {
  id: string
  title: string
  abstract: string
  authors?: {
    nickname: string
  }[]
  published_timestamp: number
}

interface GeekparkItem {
  post: GeekparkPost
}

interface GeekparkResponse {
  homepage_posts: GeekparkItem[]
}

export default defineSource(async () => {
  const url = "https://mainssl.geekpark.net/api/v2"
  const res: GeekparkResponse = await myFetch(url)
  return res.homepage_posts.map((v) => {
    const post = v.post
    return {
      id: post.id,
      title: post.title,
      url: `https://www.geekpark.net/news/${post.id}`,
      extra: {
        info: post.authors?.[0]?.nickname,
        hover: post.abstract,
        date: post.published_timestamp,
      },
    }
  })
})
