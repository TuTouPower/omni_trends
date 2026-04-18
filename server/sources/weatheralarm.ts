interface WeatherAlarmItem {
  alertid: string
  title: string
  issuetime: string
  pic: string
  url: string
}

interface WeatherAlarmResponse {
  data: {
    page: {
      list: WeatherAlarmItem[]
    }
  }
}

export default defineSource(async () => {
  const url = "http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province="
  const res: WeatherAlarmResponse = await myFetch(url)

  return res.data.page.list.map(v => ({
    id: v.alertid,
    title: v.title,
    url: `http://nmc.cn${v.url}`,
    extra: {
      info: v.issuetime,
      icon: v.pic,
      date: v.issuetime,
    },
  }))
})
