import * as cheerio from "cheerio"

interface HistoryItem {
  title: string
  cover: string
  pic_share: string
  desc: string
  year: string
  link: string
}

interface HistoryResponse {
  [month: string]: {
    [monthDay: string]: HistoryItem[]
  }
}

export default defineSource(async () => {
  const now = new Date()
  // Use UTC+8 for China time
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const month = (chinaTime.getUTCMonth() + 1).toString().padStart(2, "0")
  const day = chinaTime.getUTCDate().toString().padStart(2, "0")

  const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json?_=${Date.now()}`
  const res: HistoryResponse = await myFetch(url)

  const key = `${month}${day}`
  const list = res[month]?.[key] || []

  return list.map((v, index) => ({
    id: `${month}${day}-${index}`,
    title: cheerio.load(v.title).text().trim(),
    url: v.link,
    extra: {
      info: v.year,
      hover: cheerio.load(v.desc).text().trim(),
      icon: v.cover ? v.pic_share : undefined,
    },
  }))
})
