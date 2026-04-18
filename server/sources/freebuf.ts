import https from "node:https"
import type { NewsItem } from "@shared/types"

function rawFetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        rawFetch(res.headers.location).then(resolve).catch(reject)
        return
      }
      let body = ""
      res.on("data", (chunk: string) => body += chunk)
      res.on("end", () => resolve(body))
    })
    req.on("error", reject)
  })
}

export default defineSource(async () => {
  const baseUrl = "https://www.freebuf.com"
  const html = await rawFetch(baseUrl)
  const nuxtStart = html.indexOf("window.__NUXT__=")
  const nuxtEnd = html.indexOf("</script>", nuxtStart)
  if (nuxtStart === -1 || nuxtEnd === -1) throw new Error("Cannot extract NUXT data")
  const raw = html.slice(nuxtStart + "window.__NUXT__=".length, nuxtEnd)

  const news: NewsItem[] = []
  const pairs = raw.matchAll(/ID:(\d+),post_title:"([^"]+)",[\w":,./\-]+url:"([^"]+)"/g)
  for (const m of pairs) {
    news.push({
      id: m[1],
      title: m[2],
      url: `${baseUrl}${m[3]}`,
    })
  }
  return news
})
