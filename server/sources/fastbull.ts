import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const express = defineSource(async () => {
  const baseURL = "https://www.fastbull.com"
  const html: string = await myFetch(`${baseURL}/cn/express-news`)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  $(".news-list").each((_, el) => {
    const $el = $(el)
    const date = $el.attr("data-date")
    const id = $el.attr("data-id")
    const title = $el.find(".title_name").text().trim()
    const href = $el.find(".shear_box").attr("data-href")
    if (title && id && date) {
      news.push({
        url: href ? baseURL + href : `${baseURL}/cn/express-news`,
        title,
        id,
        pubDate: Number(date),
      })
    }
  })
  return news
})

const news = defineSource(async () => {
  const baseURL = "https://www.fastbull.com"
  const html: string = await myFetch(`${baseURL}/cn/news`)
  const $ = cheerio.load(html)
  const $main = $(".trending_type")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const a = $(el)
    const url = a.attr("href")
    const title = a.find(".title").text()
    const date = a.find("[data-date]").attr("data-date")
    if (url && title && date) {
      news.push({
        url: baseURL + url,
        title,
        id: url,
        pubDate: Number(date),
      })
    }
  })
  return news
})

export default defineSource(
  {
    "fastbull": express,
    "fastbull-express": express,
    "fastbull-news": news,
  },
)
