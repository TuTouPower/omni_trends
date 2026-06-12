import https from "node:https"
import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"

function fetchViaNodeHttps(url: string, timeout = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      timeout,
    }, (res) => {
      let data = ""
      res.on("data", chunk => data += chunk)
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(`freebuf HTTP ${res.statusCode}`))
        }
      })
    })
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("freebuf request timeout"))
    })
    req.on("error", reject)
  })
}

export default defineSource(async () => {
  const xml = await fetchViaNodeHttps("https://www.freebuf.com/feed")
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
