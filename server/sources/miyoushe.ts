interface MiyoushePostData {
  post_id: string
  subject: string
  content: string
  cover: string
  images?: string[]
  created_at: number
  view_status: number
}

interface MiyousheUser {
  nickname: string
}

interface MiyousheItem {
  post: MiyoushePostData
  user?: MiyousheUser
}

interface MiyousheResponse {
  data: {
    list: MiyousheItem[]
  }
}

async function fetchMiyoushe(gids: number, type = 1) {
  const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${gids}&last_id=&page_size=20&type=${type}`
  const res: MiyousheResponse = await myFetch(url)

  return res.data.list.map((v) => {
    const data = v.post
    return {
      id: data.post_id,
      title: data.subject,
      url: `https://www.miyoushe.com/ys/article/${data.post_id}`,
      extra: {
        hover: data.content?.slice(0, 100),
        date: new Date(data.created_at * 1000).valueOf(),
      },
    }
  })
}

const genshin = defineSource(() => fetchMiyoushe(2))
const starrail = defineSource(() => fetchMiyoushe(6))
const honkai = defineSource(() => fetchMiyoushe(1))

export default defineSource({
  "miyoushe": genshin,
  "miyoushe-genshin": genshin,
  "miyoushe-starrail": starrail,
  "miyoushe-honkai": honkai,
})
