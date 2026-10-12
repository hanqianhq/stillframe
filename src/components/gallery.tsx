import { useMemo, useState, type ReactNode } from "react"
import { ImagesIcon } from "lucide-react"

import { JustifiedGrid } from "@/components/justified-grid"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Wallpaper } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useViewer } from "@/lib/viewer"

type Orientation = "all" | "landscape" | "portrait"

const chip =
  "h-8 rounded-full border-0 bg-transparent px-3.5 text-[13px] text-muted-foreground shadow-none hover:bg-white/6 hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"

export function Gallery({
  id,
  title,
  items,
  showCharacters = false,
  showGame = false,
  empty,
}: {
  id?: string
  title: ReactNode
  items: Wallpaper[]
  showCharacters?: boolean
  showGame?: boolean
  empty?: ReactNode
}) {
  const viewer = useViewer()
  const [orientation, setOrientation] = useState<Orientation>("all")
  const [uhd, setUhd] = useState(false)
  const [character, setCharacter] = useState("")

  const people = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of items)
      for (const c of w.character.split(" / ")) counts.set(c, (counts.get(c) ?? 0) + 1)
    return [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1])
  }, [items])

  const filtered = useMemo(
    () =>
      items.filter(
        (w) =>
          (orientation === "all" || w.orientation === orientation) &&
          (!uhd || w.isUHD) &&
          (!character || w.character.split(" / ").includes(character)),
      ),
    [items, orientation, uhd, character],
  )

  const counts = useMemo(
    () => ({
      landscape: items.filter((w) => w.orientation === "landscape").length,
      portrait: items.filter((w) => w.orientation === "portrait").length,
      uhd: items.filter((w) => w.isUHD).length,
    }),
    [items],
  )

  const reset = () => {
    setOrientation("all")
    setUhd(false)
    setCharacter("")
  }

  if (!items.length && empty) return <>{empty}</>

  return (
    <section id={id} className="mx-auto w-full max-w-[1680px] scroll-mt-20 px-3 sm:px-10 lg:px-14">
      <div className="flex flex-col gap-4 px-2 pb-5 sm:px-0 md:flex-row md:items-end md:justify-between">
        <h2 className="flex items-baseline gap-3 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {title}
          <span className="tabular text-base font-normal text-muted-foreground">{filtered.length}</span>
        </h2>
        <div className="-mx-2 flex items-center gap-1 overflow-x-auto px-2 no-scrollbar">
          {counts.landscape > 0 && counts.portrait > 0 && (
            <ToggleGroup
              type="single"
              value={orientation}
              onValueChange={(v) => v && setOrientation(v as Orientation)}
              aria-label="画面方向"
              className="gap-1"
            >
              <ToggleGroupItem value="all" className={chip}>全部</ToggleGroupItem>
              <ToggleGroupItem value="landscape" className={chip}>
                横版 <span className="tabular opacity-60">{counts.landscape}</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="portrait" className={chip}>
                竖版 <span className="tabular opacity-60">{counts.portrait}</span>
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          {counts.uhd > 0 && (
            <>
              {counts.landscape > 0 && counts.portrait > 0 && (
                <span className="mx-1.5 h-4 w-px shrink-0 bg-border" aria-hidden />
              )}
              <Toggle pressed={uhd} onPressedChange={setUhd} className={chip} aria-label="仅看 4K 原图">
                4K 原图 <span className="tabular opacity-60">{counts.uhd}</span>
              </Toggle>
            </>
          )}
        </div>
      </div>

      {showCharacters && people.length > 1 && (
        <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-3 no-scrollbar sm:px-1">
          <button
            onClick={() => setCharacter("")}
            className={cn(
              "focus-frame h-8 shrink-0 rounded-full px-3.5 text-[13px] transition-colors",
              !character ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            所有角色
          </button>
          {people.map(([name, n]) => (
            <button
              key={name}
              aria-pressed={character === name}
              onClick={() => setCharacter(character === name ? "" : name)}
              className={cn(
                "focus-frame h-8 shrink-0 rounded-full border px-3.5 text-[13px] transition-colors",
                character === name
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-white/25 hover:text-foreground",
              )}
            >
              {name}
              <span className="tabular ml-1.5 opacity-60">{n}</span>
            </button>
          ))}
        </div>
      )}

      {filtered.length ? (
        <JustifiedGrid
          items={filtered}
          showGame={showGame}
          onOpen={(id) => viewer.open(id, filtered.map((w) => w.id))}
        />
      ) : (
        <Empty className="rounded-2xl border border-dashed py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagesIcon />
            </EmptyMedia>
            <EmptyTitle>没有符合条件的作品</EmptyTitle>
            <EmptyDescription>换个方向或角色看看，或者清除筛选。</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" className="rounded-full" onClick={reset}>
              清除筛选
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
  )
}
