import type { SourceID } from "@shared/types"
import { useTranslation } from "react-i18next"
import { useUpdateQuery } from "./query"

export function useRefetch() {
  const { enableLogin, loggedIn, login } = useLogin()
  const toaster = useToast()
  const updateQuery = useUpdateQuery()
  const { t } = useTranslation()
  /**
   * force refresh
   */
  const refresh = useCallback((...sources: SourceID[]) => {
    if (enableLogin && !loggedIn) {
      toaster(t("toast.forceRefresh"), {
        type: "warning",
        action: {
          label: t("toast.login"),
          onClick: login,
        },
      })
    } else {
      refetchSources.clear()
      sources.forEach(id => refetchSources.add(id))
      updateQuery(...sources)
    }
  }, [loggedIn, toaster, login, enableLogin, updateQuery, t])

  return {
    refresh,
    refetchSources,
  }
}
