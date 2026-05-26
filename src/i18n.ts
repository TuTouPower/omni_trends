import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zh from "./locales/zh.json"
import en from "./locales/en.json"

function detectLang(): "zh" | "en" {
  try {
    return navigator.language.startsWith("zh") ? "zh" : "en"
  } catch {
    return "zh"
  }
}

const savedLang = (() => {
  try {
    return localStorage.getItem("lang") as "zh" | "en" | null
  } catch {
    return null
  }
})()

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: savedLang || detectLang(),
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
  saveMissing: false,
})

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("lang", lng)
  } catch {}
})

export default i18n
