/* eslint-disable node/prefer-global/process */
import { createRequire } from "node:module"
import { $fetch } from "ofetch"

// 需要代理的域名关键词（国际站点）
const PROXY_DOMAINS = [
  "reddit.com",
  "hackernews",
  "ycombinator.com",
  "bbc.",
  "nytimes.com",
  "theguardian.com",
  "economist.com",
  "washingtonpost.com",
  "nhk.or.jp",
  "wsj.com",
  "reuters.com",
  "aljazeera.com",
  "huggingface.co",
  "google.com",
  "googleapis.com",
  "producthunt.com",
  "apnews.com",
]

let proxyAgent: any = null

if (!process.env.CF_PAGES) {
  const proxyUrl = process.env.HTTPS_PROXY
    || process.env.https_proxy
    || process.env.HTTP_PROXY
    || process.env.http_proxy

  if (proxyUrl) {
    try {
      const require = createRequire(import.meta.url)
      const { ProxyAgent } = require("undici")
      proxyAgent = new ProxyAgent({
        uri: proxyUrl,
        requestTls: { rejectUnauthorized: false },
      })
      logger.info(`proxy agent ready: ${proxyUrl}`)
    } catch (e) {
      logger.warn("failed to init proxy agent", e)
    }
  }
}

function needsProxy(url: string): boolean {
  if (!proxyAgent) return false
  return PROXY_DOMAINS.some(domain => url.includes(domain))
}

const baseFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})

// 智能代理：国际站点走代理，国内站点直连
export const myFetch: typeof baseFetch = (url, opts?) => {
  const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : ""
  if (needsProxy(urlStr)) {
    return baseFetch(url, { ...opts, dispatcher: proxyAgent } as any)
  }
  return baseFetch(url, opts)
}
