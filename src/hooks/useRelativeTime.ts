import { useMount } from "react-use"
import i18n from "~/i18n"

/**
 * changed every minute
 */
const timerAtom = atom(0)

timerAtom.onMount = (set) => {
  const timer = setInterval(() => {
    set(Date.now())
  }, 60 * 1000)
  return () => clearInterval(timer)
}

function useVisibility() {
  const [visible, setVisible] = useState(true)
  useMount(() => {
    const handleVisibilityChange = () => {
      setVisible(document.visibilityState === "visible")
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  })
  return visible
}

function relativeTimeI18n(timestamp: string | number): string | undefined {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  if (Number.isNaN(date.getDay())) return undefined

  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000
  const diffInMinutes = diffInSeconds / 60
  const diffInHours = diffInMinutes / 60

  const t = i18n.t.bind(i18n)

  if (diffInSeconds < 60) {
    return t("time.justNow")
  } else if (diffInMinutes < 60) {
    return t("time.minutesAgo", { count: Math.floor(diffInMinutes) })
  } else if (diffInHours < 24) {
    return t("time.hoursAgo", { count: Math.floor(diffInHours) })
  } else {
    return t("time.date", { month: date.getMonth() + 1, day: date.getDate() })
  }
}

export function useRelativeTime(timestamp: string | number) {
  const [time, setTime] = useState<string>()
  const timer = useAtomValue(timerAtom)
  const visible = useVisibility()

  useEffect(() => {
    if (visible) {
      const t = relativeTimeI18n(timestamp)
      if (t) setTime(t)
    }
  }, [timestamp, timer, visible])

  return time
}
