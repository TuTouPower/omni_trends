import process from "node:process"
import { ProxyAgent, setGlobalDispatcher } from "undici"
import { $fetch } from "ofetch"

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
}

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
})
