interface NeteaseArtist {
  name: string
}

interface NeteaseAlbum {
  picUrl: string
}

interface NeteaseTrack {
  id: number
  name: string
  artists: NeteaseArtist[]
  album: NeteaseAlbum
  duration: number
}

interface NeteaseMusicResponse {
  code: number
  result: {
    tracks: NeteaseTrack[]
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const neteaseMusic = defineSource(async () => {
  const url = "https://music.163.com/api/playlist/detail?id=3778678"
  const res: NeteaseMusicResponse = await myFetch(url, {
    headers: {
      Referer: "https://music.163.com/",
    },
  })

  if (res.code !== 200) {
    throw new Error("Netease Music API returned non-200 code")
  }

  return res.result.tracks.map(v => ({
    id: v.id,
    title: v.name,
    url: `https://music.163.com/#/song?id=${v.id}`,
    extra: {
      info: `${v.artists.map(a => a.name).join("/")} · ${formatDuration(v.duration)}`,
      icon: v.album.picUrl,
    },
  }))
})

export default defineSource({
  "netease-music": neteaseMusic,
})
