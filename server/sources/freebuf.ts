import https from "node:https"
import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"

function fetchRSS(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchRSS(res.headers.location).then(resolve).catch(reject)
        return
      }
      let body = ""
      res.on("data", (chunk: string) => body += chunk)
      res.on("end", () => resolve(body))
    }).on("error", reject)
  })
}

export default defineSource(async () => {
  const xml = await fetchRSS("https://www.freebuf.com/feed")
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" })
  const result = parser.parse(xml)
  const items = result?.rss?.channel?.item || []

  if (!items.length) throw new Error("Cannot fetch freebuf RSS")

  return items.map((item: any) => ({
    title: item.title,
    url: item.link,
    id: item.link,
    pubDate: item.pubDate,
  })) as NewsItem[]
})
