import { defineRSSSource } from "#/utils/source"

const nytimesChina = defineRSSSource("https://cn.nytimes.com/rss/")
const nytimesGlobal = defineRSSSource("https://rss.nytimes.com/services/xml/rss/nyt/World.xml")

export default defineSource({
  "nytimes": nytimesChina,
  "nytimes-china": nytimesChina,
  "nytimes-global": nytimesGlobal,
})
