interface NewsmthArticle {
  topicId: string
  subject: string
  body: string
  account?: { name: string }
  postTime: string
}

interface NewsmthTopic {
  firstArticleId: string
  article: NewsmthArticle
  board?: { title: string }
}

interface NewsmthResponse {
  data?: {
    topics: NewsmthTopic[]
  }
}

export default defineSource(async () => {
  const url = "https://wap.newsmth.net/wap/api/hot/global"
  const res: NewsmthResponse = await myFetch(url)

  return res.data!.topics.map((v) => {
    const post = v.article
    return {
      id: v.firstArticleId,
      title: post.subject,
      url: `https://wap.newsmth.net/article/${post.topicId}?title=${v.board?.title}&from=home`,
      extra: {
        hover: post.body?.slice(0, 100),
        date: post.postTime,
      },
    }
  })
})
