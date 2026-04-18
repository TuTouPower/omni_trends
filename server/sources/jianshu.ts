import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const html: string = await myFetch("https://www.jianshu.com/", {
    headers: {
      Referer: "https://www.jianshu.com",
    },
  })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  $("ul.note-list li").each((_, el) => {
    const dom = $(el)
    const href = dom.find("a.title").attr("href") || ""
    const title = dom.find("a.title").text()?.trim()
    const desc = dom.find("p.abstract").text()?.trim()
    const author = dom.find("a.nickname").text()?.trim()

    if (href && title) {
      const id = href.match(/([^/]+)$/)?.[1] || href
      news.push({
        id,
        title,
        url: `https://www.jianshu.com${href}`,
        extra: {
          hover: desc,
          info: author,
        },
      })
    }
  })

  return news
})
