import type { NewsItem } from "@shared/types"

interface WereadBookInfo {
  bookId: string
  title: string
  author: string
  intro: string
  cover: string
  publishTime: string
}

interface WereadBookItem {
  bookInfo: WereadBookInfo
  readingCount: number
}

interface WereadResponse {
  books: WereadBookItem[]
}

// Encode bookId to weread URL ID
// Thanks @MCBBC and ChatGPT
async function getWereadID(bookId: string): Promise<string | undefined> {
  try {
    const str = await md5(bookId)
    let strSub = str.substring(0, 3)

    let fa: [string, string[]]
    if (/^\d*$/.test(bookId)) {
      const chunks: string[] = []
      for (let i = 0; i < bookId.length; i += 9) {
        const chunk = bookId.substring(i, i + 9)
        chunks.push(Number.parseInt(chunk).toString(16))
      }
      fa = ["3", chunks]
    } else {
      let hexStr = ""
      for (let i = 0; i < bookId.length; i++) {
        hexStr += bookId.charCodeAt(i).toString(16)
      }
      fa = ["4", [hexStr]]
    }

    strSub += fa[0]
    strSub += `2${str.substring(str.length - 2)}`

    for (let i = 0; i < fa[1].length; i++) {
      const sub = fa[1][i]
      const subLength = sub.length.toString(16)
      const subLengthPadded = subLength.length === 1 ? `0${subLength}` : subLength
      strSub += subLengthPadded + sub
      if (i < fa[1].length - 1) {
        strSub += "g"
      }
    }

    if (strSub.length < 20) {
      strSub += str.substring(0, 20 - strSub.length)
    }

    const finalStr = await md5(strSub)
    strSub += finalStr.substring(0, 3)

    return strSub
  } catch {
    return undefined
  }
}

export default defineSource(async () => {
  const url = "https://weread.qq.com/web/bookListInCategory/rising?rank=1"
  const res: WereadResponse = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
    },
  })

  const news: NewsItem[] = []
  for (const v of res.books) {
    const data = v.bookInfo
    const encodedId = await getWereadID(data.bookId)
    news.push({
      id: data.bookId,
      title: data.title,
      url: encodedId
        ? `https://weread.qq.com/web/bookDetail/${encodedId}`
        : "https://weread.qq.com/",
      extra: {
        info: `${data.author} · ${v.readingCount}人在读`,
        hover: data.intro,
        icon: data.cover.replace("s_", "t9_"),
      },
    })
  }
  return news
})
