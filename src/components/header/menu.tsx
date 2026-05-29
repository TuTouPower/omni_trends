import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

function ThemeToggle() {
  const { isDark, toggleDark } = useDark()
  const { t } = useTranslation()
  return (
    <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
      <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph-sun-dim-duotone")} />
      <span>
        {isDark ? t("menu.lightMode") : t("menu.darkMode")}
      </span>
    </li>
  )
}

export function Menu() {
  const [shown, show] = useState(false)
  const { t } = useTranslation()
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center scale-90">
        <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
      </span>
      {shown && (
        <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
          <motion.div
            id="dropdown-menu"
            className={$([
              "w-200px",
              "bg-primary backdrop-blur-5 bg-op-70! rounded-lg shadow-xl",
            ])}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
          >
            <ol className="bg-base bg-op-70! backdrop-blur-md p-2 rounded-lg color-base text-base">
              <ThemeToggle />
              <li onClick={() => window.open(Homepage)} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                <span className="i-ph:github-logo-duotone inline-block" />
                <span>{t("menu.star")}</span>
              </li>
              <li className="flex gap-2 items-center">
                <a
                  href="https://github.com/TuTouPower/omni_trends"
                >
                  <img
                    alt="GitHub stars badge"
                    src="https://img.shields.io/github/stars/TuTouPower/omni_trends?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
                <a
                  href="https://github.com/TuTouPower/omni_trends/fork"
                >
                  <img
                    alt="GitHub forks badge"
                    src="https://img.shields.io/github/forks/TuTouPower/omni_trends?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
