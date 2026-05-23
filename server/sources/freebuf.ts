import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const xml = await myFetch<string>("https://www.freebuf.com/feed", {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    responseType: "text",
  })
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
