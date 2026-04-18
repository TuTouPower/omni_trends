interface NgaItem {
  tid: string
  subject: string
  author: string
  replies: number
  postdate: string
  tpcurl: string
}

interface NgaResponse {
  result: NgaItem[][]
}

export default defineSource(async () => {
  const url = "https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1"
  const res: NgaResponse = await myFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://ngabbs.com/",
      "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
    },
    body: { __output: "14" },
  })

  const list = res.result[0]
  return list.map(v => ({
    id: v.tid,
    title: v.subject,
    url: `https://bbs.nga.cn${v.tpcurl}`,
    extra: {
      info: `${v.replies} 回复`,
      date: v.postdate,
    },
  }))
})
