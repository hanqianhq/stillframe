import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Dialog as DialogPrimitive } from "radix-ui"
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Link2Icon,
  MaximizeIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DownloadMenu } from "@/components/download-menu"
import { ProgressiveImage } from "@/components/progressive-image"
import { SaveButton } from "@/components/save-button"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getGame, getWallpaper, type Wallpaper } from "@/lib/catalog"
import { aspectLabel, formatDate, formatResolution, resolutionClass } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useViewer } from "@/lib/viewer"

const ease = [0.22, 1, 0.36, 1] as const

function IconAction({
  label,
  shortcut,
  onClick,
  children,
  className,
}: {
  label: string
  shortcut?: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={label}
          onClick={onClick}
          className={cn("rounded-full text-foreground/80 hover:bg-white/10 hover:text-foreground", className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

function Stage({
  wallpaper,
  direction,
  immersive,
  onSwipe,
  onExitImmersive,
}: {
  wallpaper: Wallpaper
  direction: number
  immersive: boolean
  onSwipe: (dir: 1 | -1) => void
  onExitImmersive: () => void
}) {
  const reduce = useReducedMotion()
  const offset = reduce ? 0 : 48
  return (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={wallpaper.id}
        custom={direction}
        variants={{
          enter: (d: number) => ({ opacity: 0, x: d * offset }),
          center: { opacity: 1, x: 0 },
          exit: (d: number) => ({ opacity: 0, x: d * -offset }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.45, ease }}
        drag={immersive ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info: PanInfo) => {
          if (info.offset.x < -70 || info.velocity.x < -400) onSwipe(1)
          else if (info.offset.x > 70 || info.velocity.x > 400) onSwipe(-1)
        }}
        onClick={immersive ? onExitImmersive : undefined}
        className={cn("absolute inset-0 touch-pan-y", immersive && "cursor-zoom-out")}
      >
        <ProgressiveImage
          key={immersive ? "cover" : "contain"}
          src={wallpaper.large}
          placeholder={wallpaper.lqip}
          alt={`${wallpaper.title}，${wallpaper.character}`}
          loading="eager"
          fetchPriority="high"
          fit={immersive ? "cover" : "contain"}
          className="size-full"
          style={immersive ? { objectPosition: `${wallpaper.focus[0] * 100}% ${wallpaper.focus[1] * 100}%` } : undefined}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export function Viewer() {
  const { currentId, list, go, close } = useViewer()
  const navigate = useNavigate()
  const wallpaper = getWallpaper(currentId)
  const [direction, setDirection] = useState(0)
  const [immersive, setImmersive] = useState(false)
  const [lastId, setLastId] = useState(wallpaper?.id)

  if (wallpaper?.id !== lastId) {
    setLastId(wallpaper?.id)
    if (!wallpaper) setImmersive(false)
  }

  const index = wallpaper ? list.indexOf(wallpaper.id) : -1
  const step = useCallback(
    (dir: 1 | -1) => {
      if (index < 0 || list.length < 2) return
      setDirection(dir)
      go(list[(index + dir + list.length) % list.length])
    },
    [index, list, go],
  )

  useEffect(() => {
    if (!wallpaper) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement)?.closest("[role=menu]")) return
      if (e.key === "ArrowRight") step(1)
      else if (e.key === "ArrowLeft") step(-1)
      else if (e.key.toLowerCase() === "f") setImmersive((v) => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [wallpaper, step])

  useEffect(() => {
    if (index < 0 || list.length < 2) return
    for (const d of [1, -1]) {
      const n = getWallpaper(list[(index + d + list.length) % list.length])
      if (n) new Image().src = n.large
    }
  }, [index, list])

  const game = wallpaper ? getGame(wallpaper.game)! : undefined
  const original = wallpaper?.downloads[0]

  const share = async () => {
    if (!wallpaper) return
    const url = `${location.origin}/?w=${wallpaper.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast("链接已复制", { description: "打开链接会直接显示这幅作品" })
    } catch {
      toast("复制失败", { description: url })
    }
  }

  return (
    <DialogPrimitive.Root open={!!wallpaper} onOpenChange={(o) => !o && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.1_0.003_270)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => {
            if (immersive) {
              e.preventDefault()
              setImmersive(false)
            }
          }}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex flex-col outline-none transition-[background-color] duration-700 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.985] data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          style={{
            backgroundColor: wallpaper
              ? `color-mix(in oklch, ${wallpaper.tint} 45%, oklch(0.1 0.003 270))`
              : undefined,
          }}
        >
          {wallpaper && game && original && (
            <>
              <DialogPrimitive.Title className="sr-only">
                {wallpaper.title}，{wallpaper.character}
              </DialogPrimitive.Title>

              <header
                className={cn(
                  "relative z-10 flex h-14 shrink-0 items-center justify-between gap-3 px-3 transition-opacity duration-300 sm:h-16 sm:px-6",
                  immersive && "pointer-events-none opacity-0",
                )}
              >
                <div className="flex min-w-0 items-center gap-3 pl-2 text-[13px] sm:pl-0">
                  <span className="truncate text-foreground/80">{game.name}</span>
                  {list.length > 1 && index >= 0 && (
                    <span className="tabular shrink-0 text-muted-foreground">
                      {index + 1} / {list.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <IconAction label="铺满预览" shortcut="F" onClick={() => setImmersive(true)}>
                    <MaximizeIcon />
                  </IconAction>
                  <IconAction label="关闭" shortcut="Esc" onClick={close}>
                    <XIcon />
                  </IconAction>
                </div>
              </header>

              <div
                className={cn(
                  "relative min-h-0 flex-1 overflow-hidden transition-[margin] duration-500 ease-out-soft",
                  immersive ? "fixed inset-0 z-20" : "mx-0 sm:mx-20",
                )}
              >
                <Stage
                  wallpaper={wallpaper}
                  direction={direction}
                  immersive={immersive}
                  onSwipe={step}
                  onExitImmersive={() => setImmersive(false)}
                />
                <AnimatePresence>
                  {immersive && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-white/70 [text-shadow:0_1px_8px_rgb(0_0_0/60%)]"
                    >
                      这是它铺满当前屏幕的样子，点击任意处返回
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {list.length > 1 && !immersive && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label="上一幅"
                    onClick={() => step(-1)}
                    className="absolute top-1/2 left-4 z-10 hidden size-12 -translate-y-1/2 rounded-full text-foreground/70 hover:bg-white/10 hover:text-foreground sm:inline-flex"
                  >
                    <ChevronLeftIcon className="size-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label="下一幅"
                    onClick={() => step(1)}
                    className="absolute top-1/2 right-4 z-10 hidden size-12 -translate-y-1/2 rounded-full text-foreground/70 hover:bg-white/10 hover:text-foreground sm:inline-flex"
                  >
                    <ChevronRightIcon className="size-6" />
                  </Button>
                </>
              )}

              <footer
                className={cn(
                  "relative z-10 shrink-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-opacity duration-300 sm:px-8 sm:pt-5 sm:pb-6",
                  immersive && "pointer-events-none opacity-0",
                )}
              >
                <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={wallpaper.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease } }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      className="min-w-0"
                    >
                      <div className="flex items-baseline gap-3">
                        <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                          {wallpaper.title}
                        </h2>
                        <span className="shrink-0 text-[15px] text-foreground/70">{wallpaper.character}</span>
                      </div>
                      <div className="tabular mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                        <span className="text-foreground/85">
                          {formatResolution(original.width, original.height)}
                          <span className="ml-1.5 text-muted-foreground">{resolutionClass(original.width, original.height)}</span>
                        </span>
                        <span>{aspectLabel(original.width, original.height)} {wallpaper.orientation === "landscape" ? "横版" : "竖版"}</span>
                        <span>收录于 {formatDate(wallpaper.addedAt)}</span>
                        <span className="flex gap-1">
                          {wallpaper.tags.map((t) => (
                            <button
                              key={t}
                              onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)}
                              className="focus-frame rounded-full px-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              #{t}
                            </button>
                          ))}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex shrink-0 items-center gap-2">
                    <DownloadMenu wallpaper={wallpaper} align="end">
                      <Button className="h-11 flex-1 rounded-full px-6 text-[15px] active:scale-[0.98] md:flex-none">
                        <DownloadIcon data-icon="inline-start" />
                        下载
                        <span className="tabular ml-1 text-primary-foreground/60">
                          {wallpaper.downloads.length} 个版本
                        </span>
                      </Button>
                    </DownloadMenu>
                    <SaveButton id={wallpaper.id} className="size-11 bg-white/10 hover:bg-white/18" />
                    <Button
                      variant="secondary"
                      size="icon-lg"
                      aria-label="复制链接"
                      onClick={share}
                      className="size-11 rounded-full bg-white/10 hover:bg-white/18"
                    >
                      <Link2Icon className="size-[18px]" />
                    </Button>
                  </div>
                </div>
              </footer>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
