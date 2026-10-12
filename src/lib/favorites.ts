import { useCallback, useSyncExternalStore } from "react"

const KEY = "stillframe:saved"
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]")
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

let snapshot = read()

function write(next: string[]) {
  snapshot = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = read()
      cb()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", onStorage)
  }
}

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, () => snapshot)
  const toggle = useCallback((id: string) => {
    const cur = snapshot
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]
    write(next)
    return next.includes(id)
  }, [])
  const isSaved = useCallback((id: string) => saved.includes(id), [saved])
  return { saved, toggle, isSaved }
}
