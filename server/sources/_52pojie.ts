import { Buffer } from "node:buffer"
import iconv from "iconv-lite"
import type { NewsItem } from "@shared/types"
import { XMLParser } from "fast-xml-parser"

const pojie = defineSource(async () => {
  const url = "https://www.52pojie.cn/forum.php?mod=guide&view=digest&rss=1"
  const response: ArrayBuffer = await myFetch(url, { responseType: "arrayBuffer" })
  const utf8String = iconv.decode(Buffer.from(response), "gbk")

  const xml = new XMLParser({
    attributeNamePrefix: "",
    textNodeName: "$text",
    ignoreAttributes: false,
  })

  const result = xml.parse(utf8String)
  let channel = result.rss?.channel
  if (Array.isArray(channel)) channel = channel[0]

  let items = channel?.item || []
  if (!Array.isArray(items)) items = [items]

  return items.map((v: any, i: number) => ({
    id: v.guid?.$text ?? v.guid ?? i,
    title: v.title?.$text ?? v.title ?? "",
    url: v.link ?? "",
  })) as NewsItem[]
})

export default defineSource({
  "52pojie": pojie,
})
