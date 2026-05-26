import type { FixedColumnID } from "@shared/types"
import { useTitle } from "react-use"
import { useTranslation } from "react-i18next"
import { NavBar } from "../navbar"
import { Dnd } from "./dnd"
import { currentColumnIDAtom } from "~/atoms"

export function Column({ id }: { id: FixedColumnID }) {
  const [currentColumnID, setCurrentColumnID] = useAtom(currentColumnIDAtom)
  const { t } = useTranslation()
  useEffect(() => {
    setCurrentColumnID(id)
  }, [id, setCurrentColumnID])

  useTitle(t("title.page", { name: t(`column.${id}`) }))

  return (
    <>
      <div className="flex justify-center md:hidden mb-6">
        <NavBar />
      </div>
      {id === currentColumnID && <Dnd />}
    </>
  )
}
