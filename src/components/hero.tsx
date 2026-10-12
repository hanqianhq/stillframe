import { useEffect, useRef } from "react"
import { Link } from "react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowRightIcon, DownloadIcon, ExpandIcon } from "lucide-react"

import { DownloadMenu } from "@/components/download-menu"
import { GameRail } from "@/components/game-rail"
import { ProgressiveImage } from "@/components/progressive-image"
import { SaveButton } from "@/components/save-button"
import { Button } from "@/components/ui/button"
import { getGame, type GameSlug, type Wallpaper } from "@/lib/catalog"
import { formatResolution, resolutionClass } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useViewer } from "@/lib/viewer"

const ease = [0.22, 1, 0.36, 1] as const

export function preload(src: string) {
  const img = new Image()
  img.decoding = "async"
  img.src = src
}

function Backdrop({ wallpaper }: { wallpaper: Wallpaper }) {
  const reduce = useReducedMotion()
  const [fx, fy] = wallpaper.focus
  return (
    <div className="absolute inset-0 -z-10 bg-background" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.div
          key={wallpaper.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: reduce ? 1 : 1.045 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { opacity: { duration: 0.9, ease }, scale: { duration: 2.4, ease } },
          }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease, delay: 0.1 } }}
        >
          <ProgressiveImage
            src={wallpaper.large}
            placeholder={wallpaper.lqip}
            alt=""
            loading="eager"
            fetchPriority="high"
            className="size-full"
            style={{ objectPosition: `${fx * 100}% ${fy * 100}%` }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-black/50 via-black/20 to-transparent md:block" />
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-(--ambient) via-[color-mix(in_oklch,var(--ambient)_75%,transparent)] to-transparent" />
    </div>
  )
}

function FeatureStrip({
  picks,
  activeId,
  onActive,
  onOpen,
  label,
}: {
  picks: Wallpaper[]
  activeId: string
  onActive: (id: string) => void
  onOpen: (id: string) => void
  label: string
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | undefined>(undefined)

  // Touch devices: the card snapped nearest the centre drives the hero.
  useEffect(() => {
    const root = scroller.current
    if (!root || !window.matchMedia("(hover: none)").matches) return
    const ratios = new Map<Element, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.intersectionRatio)
        let best: Element | null = null
        let bestRatio = 0.6
        for (const [el, r] of ratios) {
          if (r > bestRatio) {
            best = el
            bestRatio = r
          }
        }
        const id = (best as HTMLElement | null)?.dataset.id
        if (id) onActive(id)
      },
      { root, rootMargin: "0px -18% 0px -18%", threshold: [0, 0.6, 0.8, 1] },
    )
    root.querySelectorAll("[data-id]").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [picks, onActive])

  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2 text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="tabular text-muted-foreground">{picks.length}</span>
      </div>
      <div
        ref={scroller}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pt-3 pb-9 no-scrollbar sm:-mx-10 sm:scroll-px-10 sm:px-10 lg:-mx-14 lg:scroll-px-14 lg:px-14"
      >
        {picks.map((w) => {
          const active = w.id === activeId
          return (
            <button
              key={w.id}
              data-id={w.id}
              onMouseEnter={() => {
                preload(w.large)
                window.clearTimeout(hoverTimer.current)
                hoverTimer.current = window.setTimeout(() => onActive(w.id), 90)
              }}
              onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
              onFocus={() => onActive(w.id)}
              onClick={() => onOpen(w.id)}
              aria-label={`${w.title}，${w.character}`}
              aria-current={active ? "true" : undefined}
              className="focus-frame group relative w-[68vw] shrink-0 snap-start rounded-xl sm:w-[232px] lg:w-[256px]"
            >
              <motion.div
                animate={{ scale: active ? 1 : 0.94 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className={cn(
                  "aspect-video overflow-hidden rounded-xl bg-card transition-[box-shadow,opacity] duration-300",
                  active
                    ? "shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)]"
                    : "opacity-70 group-hover:opacity-100",
                )}
              >
                <ProgressiveImage
                  src={w.thumb}
                  placeholder={w.lqip}
                  alt=""
                  className="size-full"
                  style={{ objectPosition: `${w.focus[0] * 100}% 50%` }}
                />
              </motion.div>
              <span
                className={cn(
                  "absolute inset-x-1 top-full mt-2 truncate text-left text-[13px] transition-opacity duration-300",
                  active ? "opacity-100" : "opacity-0",
                )}
              >
                {w.title}
                <span className="ml-2 text-muted-foreground">{w.character}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Hero({
  game,
  picks,
  active,
  onActive,
  onSelectGame,
}: {
  game: GameSlug | undefined
  picks: Wallpaper[]
  active: Wallpaper
  onActive: (id: string) => void
  onSelectGame: (slug: GameSlug | undefined) => void
}) {
  const viewer = useViewer()
  const shownGame = getGame(active.game)!
  const original = active.downloads[0]
  const openActive = (id = active.id) => viewer.open(id, picks.map((p) => p.id))

  return (
    <section className="relative isolate flex h-[88svh] min-h-[600px] flex-col sm:h-[100svh] sm:max-h-[1180px] sm:min-h-[680px]">
      <Backdrop wallpaper={active} />
      <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-5 pt-16 sm:px-10 sm:pt-20 lg:px-14">
        <GameRail active={game} onSelect={onSelectGame} />

        <div className="mt-auto max-w-[680px] pb-6 sm:pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={shownGame.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            >
              <p className="flex items-center gap-3 text-[13px] text-foreground/70">
                {shownGame.en}
                {!game && (
                  <Link
                    to={`/g/${shownGame.slug}`}
                    className="focus-frame inline-flex items-center gap-1 rounded-full text-foreground/90 underline-offset-4 hover:underline"
                  >
                    进入专区
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                )}
              </p>
              <h1 className="mt-2 text-[44px] leading-[1.05] font-semibold tracking-[-0.02em] sm:text-6xl lg:text-[76px]">
                {shownGame.name}
              </h1>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.05 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"
            >
              <span className="text-[17px] font-medium">{active.title}</span>
              <span className="text-[15px] text-foreground/70">{active.character}</span>
              <span className="tabular text-[13px] text-foreground/55">
                {formatResolution(original.width, original.height)}
                <span className="ml-2">{resolutionClass(original.width, original.height)} 原图</span>
              </span>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-3">
            <Button
              size="lg"
              onClick={() => openActive()}
              className="h-11 rounded-full px-6 text-[15px] active:scale-[0.98]"
            >
              <ExpandIcon data-icon="inline-start" />
              查看大图
            </Button>
            <DownloadMenu wallpaper={active}>
              <Button
                variant="secondary"
                size="lg"
                className="h-11 rounded-full bg-white/12 px-5 text-[15px] hover:bg-white/20 active:scale-[0.98]"
              >
                <DownloadIcon data-icon="inline-start" />
                下载
              </Button>
            </DownloadMenu>
            <SaveButton id={active.id} className="size-11 bg-white/12 hover:bg-white/20" />
          </div>
        </div>

        <FeatureStrip
          picks={picks}
          activeId={active.id}
          onActive={onActive}
          onOpen={openActive}
          label={game ? "本区精选" : "各游戏精选"}
        />
      </div>
    </section>
  )
}
