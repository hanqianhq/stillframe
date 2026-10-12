import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import { useSearchParams } from "react-router"

import { getWallpaper, wallpapersOf } from "@/lib/catalog"

interface ViewerApi {
  currentId: string | null
  list: string[]
  open: (id: string, list?: string[]) => void
  go: (id: string) => void
  close: () => void
}

const ViewerContext = createContext<ViewerApi | null>(null)

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const currentId = params.get("w")
  const listRef = useRef<string[]>([])
  const pushedRef = useRef(false)

  const current = getWallpaper(currentId)
  if (!current) pushedRef.current = false
  if (current && !listRef.current.includes(current.id)) {
    listRef.current = wallpapersOf(current.game).map((w) => w.id)
  }

  const setW = useCallback(
    (id: string | null, replace: boolean) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id) next.set("w", id)
          else next.delete("w")
          return next
        },
        { replace, preventScrollReset: true },
      )
    },
    [setParams],
  )

  const open = useCallback(
    (id: string, list?: string[]) => {
      if (list?.length) listRef.current = list
      pushedRef.current = true
      setW(id, false)
    },
    [setW],
  )

  const go = useCallback((id: string) => setW(id, true), [setW])

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setW(null, true)
    }
  }, [setW])

  const value = useMemo(
    () => ({
      currentId: current ? current.id : null,
      list: listRef.current,
      open,
      go,
      close,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, open, go, close],
  )

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}

export function useViewer() {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error("useViewer must be used inside ViewerProvider")
  return ctx
}
