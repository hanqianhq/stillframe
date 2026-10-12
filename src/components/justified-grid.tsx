import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { ProgressiveImage } from "@/components/progressive-image"
import { getGame, type Wallpaper } from "@/lib/catalog"
import { resolutionClass } from "@/lib/format"

interface Row {
  items: Wallpaper[]
  height: number
}

/** Row heights breathe in a long-short-short cadence so the wall never reads as a uniform grid. */
const cadence = [1.22, 0.84, 0.92]

function layout(items: Wallpaper[], width: number, target: number, gap: number, rhythm: boolean): Row[] {
  const rows: Row[] = []
  let cur: Wallpaper[] = []
  let ratioSum = 0
  for (const w of items) {
    cur.push(w)
    ratioSum += w.width / w.height
    const t = rhythm ? target * cadence[rows.length % cadence.length] : target
    const rowWidth = ratioSum * t + gap * (cur.length - 1)
    if (rowWidth >= width) {
      const h = (width - gap * (cur.length - 1)) / ratioSum
      rows.push({ items: cur, height: h })
      cur = []
      ratioSum = 0
    }
  }
  if (cur.length) rows.push({ items: cur, height: Math.min(target, (width - gap * (cur.length - 1)) / ratioSum) })
  return rows
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function JustifiedGrid({
  items,
  onOpen,
  showGame = false,
}: {
  items: Wallpaper[]
  onOpen: (id: string) => void
  showGame?: boolean
}) {
  const [ref, width] = useWidth()
  const reduce = useReducedMotion()
  const gap = width < 640 ? 6 : 10
  const avgRatio = items.length ? items.reduce((s, w) => s + w.width / w.height, 0) / items.length : 1.5
  const perRow = width < 640 ? 2 : width < 1024 ? 2.6 : width < 1500 ? 3.3 : 3.8
  const target = Math.min(Math.max(width / (perRow * avgRatio), 120), width < 640 ? 300 : 440)
  const rows = useMemo(
    () => (width ? layout(items, width, target, gap, width >= 640) : []),
    [items, width, target, gap],
  )

  return (
    <div ref={ref} className="flex flex-col" style={{ gap }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex" style={{ gap, height: row.height }}>
          {row.items.map((w) => {
            const game = getGame(w.game)!
            return (
              <motion.button
                key={w.id}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onOpen(w.id)}
                aria-label={`${w.title}，${w.character}，${game.name}`}
                className="focus-frame group relative shrink-0 overflow-hidden rounded-lg bg-card sm:rounded-xl"
                style={{ width: row.height * (w.width / w.height), height: row.height }}
              >
                <ProgressiveImage
                  src={w.thumb}
                  placeholder={w.lqip}
                  alt=""
                  className="size-full"
                  imgClassName="transition-transform duration-[900ms] ease-out-soft group-hover:scale-[1.035]"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-1 items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-3.5 pt-10 pb-3 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:flex">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{w.title}</span>
                    <span className="block truncate text-xs text-white/70">
                      {showGame ? `${game.name} / ${w.character}` : w.character}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[11px] font-medium text-white/80">
                    {resolutionClass(w.width, w.height)}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
