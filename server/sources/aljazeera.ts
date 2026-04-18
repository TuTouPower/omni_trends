import { XMLParser } from "fast-xml-parser"

export default defineSource(async () => {
  const data = await myFetch("https://www.aljazeera.com/xml/rss/all.xml", {
    responseType: "text",
  })
  const xml = new XMLParser({
    attributeNamePrefix: "",
    textNodeName: "$text",
    ignoreAttributes: false,
  })
  const result = xml.parse(data as string)
  const channel = result.rss?.channel
  if (!channel) throw new Error("No channel found")

  let items = channel.item || []
  if (!Array.isArray(items)) items = [items]

  return items.filter((item: any) => item.title && item.link).map((item: any) => ({
    id: item.link,
    title: typeof item.title === "string" ? item.title : item.title?.$text,
    url: item.link,
    pubDate: item.pubDate,
  }))
})
