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
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const month = (chinaTime.getUTCMonth() + 1).toString().padStart(2, "0")
  const day = chinaTime.getUTCDate().toString().padStart(2, "0")

  const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`
  const res: HistoryResponse = await myFetch(url, { responseType: "json" })

  const key = `${month}${day}`
  const monthData = res[month]
  const list = (monthData && monthData[key]) || []

  return list.filter(v => v.title).map((v, index) => ({
    id: `${month}${day}-${index}`,
    title: cheerio.load(v.title).text().trim(),
    url: v.link || "",
    extra: {
      info: v.year,
      hover: v.desc ? cheerio.load(v.desc).text().trim() : undefined,
    },
  }))
})
