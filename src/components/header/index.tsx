import { Link } from "@tanstack/react-router"
import { useIsFetching } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import type { SourceID } from "@shared/types"
import { NavBar } from "../navbar"
import { Menu } from "./menu"
import { LangToggle } from "./lang-toggle"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"
import { useLang } from "~/hooks/useLang"

function GoTop() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  return (
    <button
      type="button"
      title="Go To Top"
      className={$("i-ph:arrow-fat-up-duotone", ok ? "op-50 btn" : "op-0")}
      onClick={goToTop}
    />
  )
}

function Afdian() {
  return (
    <a
      href="https://afdian.com/a/tutoupower"
      target="_blank"
      rel="noopener noreferrer"
      title="去爱发电支持作者"
    >
      <img
        src={`${import.meta.env.BASE_URL}ai_fa_dian.jpg`}
        alt="爱发电"
        className="h-6 w-6 rounded-full object-cover cursor-pointer btn"
      />
    </a>
  )
}

function Github() {
  return (
    <button type="button" title="Github" className="i-ph:github-logo-duotone btn" onClick={() => window.open(Homepage)} />
  )
}

function Refresh() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const { refresh } = useRefetch()
  const refreshAll = useCallback(() => refresh(...currentSources), [refresh, currentSources])

  const isFetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return (type === "source" && currentSources.includes(id)) || type === "entire"
    },
  })

  return (
    <button
      type="button"
      title="Refresh"
      className={$("i-ph:arrow-counter-clockwise-duotone btn", isFetching && "animate-spin i-ph:circle-dashed-duotone")}
      onClick={refreshAll}
    />
  )
}

export function Header() {
  const { lang } = useLang()
  const { t } = useTranslation()

  return (
    <>
      <span className="flex justify-self-start">
        <Link to="/" className="flex gap-2 items-center">
          <div className="h-10 w-10 bg-cover bg-center rounded" title="logo" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}favicon.png)` }} />
          <span className="text-2xl font-brand line-height-none!">
            <p>Omni</p>
            <p className="mt--1">
              <span className="color-primary-6">T</span>
              <span>rends</span>
              {lang === "zh" && (
                <span className="text-sm text-neutral-400 ml-2 tracking-widest">{t("title.site")}</span>
              )}
            </p>
          </span>
        </Link>
      </span>
      <span className="justify-self-center">
        <span className="hidden md:(inline-block)">
          <NavBar />
        </span>
      </span>
      <span className="justify-self-end flex gap-2 items-center text-xl text-primary-600 dark:text-primary">
        <GoTop />
        <Refresh />
        <Github />
        <Afdian />
        <LangToggle />
        <Menu />
      </span>
    </>
  )
}
