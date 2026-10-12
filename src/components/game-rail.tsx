import { useRef, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { BrandMark } from "@/components/brand"
import { games, wallpapersOf, type GameSlug } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface RailItem {
  key: GameSlug | "all"
  name: string
  en: string
  tile?: string
  count: number
}

const items: RailItem[] = [
  { key: "all", name: "精选", en: "Selected", count: wallpapersOf(undefined).length },
  ...games.map((g) => ({
    key: g.slug,
    name: g.name,
    en: g.en,
    tile: g.tile,
    count: wallpapersOf(g.slug).length,
  })),
]

const spring = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 } as const

export function GameRail({
  active,
  onSelect,
}: {
  active: GameSlug | undefined
  onSelect: (slug: GameSlug | undefined) => void
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeKey = active ?? "all"

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const idx = items.findIndex((i) => i.key === activeKey)
    const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length
    const item = items[next]
    onSelect(item.key === "all" ? undefined : item.key)
    refs.current[next]?.focus()
  }

  return (
    <nav aria-label="选择游戏" className="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex h-[76px] items-center gap-2.5 sm:h-[92px] sm:gap-3"
      >
        {items.map((item, i) => {
          const selected = item.key === activeKey
          return (
            <motion.div key={item.key} layout transition={spring} className="flex shrink-0 items-center gap-4">
              <motion.button
                ref={(el) => {
                  refs.current[i] = el
                }}
                layout
                transition={spring}
                role="tab"
                aria-selected={selected}
                aria-label={`${item.name}，${item.count} 幅作品`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelect(item.key === "all" ? undefined : item.key)}
                className={cn(
                  "focus-frame relative shrink-0 overflow-hidden rounded-[14px] bg-card",
                  selected
                    ? "size-[64px] shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)] sm:size-[84px]"
                    : "size-[48px] opacity-75 hover:opacity-100 sm:size-[60px]",
                )}
              >
                {item.tile ? (
                  <img src={item.tile} alt="" className="size-full object-cover" draggable={false} />
                ) : (
                  <span className="grid size-full place-items-center bg-[oklch(0.24_0.005_270)] text-foreground">
                    <BrandMark className="h-[18px] sm:h-[22px]" />
                  </span>
                )}
              </motion.button>
              <AnimatePresence initial={false} mode="popLayout">
                {selected && (
                  <motion.div
                    key="label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden min-w-max pr-3 sm:block"
                  >
                    <div className="text-[15px] font-medium leading-tight">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.en}
                      <span className="mx-1.5 text-faint">/</span>
                      <span className="tabular">{item.count}</span> 幅
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
