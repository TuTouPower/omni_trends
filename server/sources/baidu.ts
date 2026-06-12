interface Res {
  data: {
    cards: {
      content: {
        isTop?: boolean
        word: string
        rawUrl: string
        desc?: string
      }[]
    }[]
  }
}

export default defineSource(async () => {
  const rawData: string = await myFetch(`https://top.baidu.com/board?tab=realtime`)
  const jsonStr = (rawData as string).match(/<!--s-data:(.*?)-->/s)
  if (!jsonStr?.[1]) throw new Error("Cannot parse baidu page data")
  const data: Res = JSON.parse(jsonStr[1])

  return data.data.cards[0].content.filter(k => !k.isTop).map((k) => {
    return {
      id: k.rawUrl,
      title: k.word,
      url: k.rawUrl,
      extra: {
        hover: k.desc,
      },
    }
  })
})
