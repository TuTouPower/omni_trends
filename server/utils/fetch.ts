import process from "node:process"
import { createRequire } from "node:module"
import { $fetch } from "ofetch"

// 自动读取系统代理环境变量，对所有 ofetch 请求生效
if (!process.env.CF_PAGES) {
  const proxyUrl = process.env.HTTPS_PROXY
    || process.env.https_proxy
    || process.env.HTTP_PROXY
    || process.env.http_proxy

  if (proxyUrl) {
    try {
      const require = createRequire(import.meta.url)
      const { ProxyAgent, setGlobalDispatcher } = require("undici")
      setGlobalDispatcher(new ProxyAgent({
        uri: proxyUrl,
        requestTls: { rejectUnauthorized: false },
      }))
      logger.info(`proxy: ${proxyUrl}`)
    } catch (e) {
      logger.warn("failed to init proxy agent", e)
    }
  }
}

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})
