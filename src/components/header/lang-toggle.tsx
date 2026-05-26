import { useLang } from "~/hooks/useLang"

export function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <button
      type="button"
      aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
      title={lang === "zh" ? "English" : "中文"}
      className="inline-flex items-center bg-primary/10 rounded-full p-0.5 text-xs font-semibold cursor-pointer select-none"
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
    >
      <span className={$("px-2 py-0.5 rounded-full transition-colors", lang === "zh" && "bg-primary text-white")}>
        中
      </span>
      <span className={$("px-2 py-0.5 rounded-full transition-colors", lang === "en" && "bg-primary text-white")}>
        EN
      </span>
    </button>
  )
}
