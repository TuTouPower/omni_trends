import i18n from "~/i18n"

export type Lang = "zh" | "en"

export function useLang() {
  const [lang, setLangState] = useState<Lang>(i18n.language as Lang)

  useEffect(() => {
    const handler = (lng: string) => setLangState(lng as Lang)
    i18n.on("languageChanged", handler)
    return () => i18n.off("languageChanged", handler)
  }, [])

  const setLang = useCallback((l: Lang) => {
    i18n.changeLanguage(l)
  }, [])

  return { lang, setLang }
}
