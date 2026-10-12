import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { games, getGame, searchWallpapers } from "@/lib/catalog"
import { resolutionClass } from "@/lib/format"
import { useViewer } from "@/lib/viewer"

const suggestions = ["艾莲", "金克丝", "4K", "竖版", "冰霜", "双城", "黄昏", "申鹤"]

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const viewer = useViewer()
  const q = query.trim()

  const results = useMemo(() => searchWallpapers(q), [q])
  const matchedGames = useMemo(
    () =>
      q
        ? games.filter((g) => `${g.name}${g.en}`.toLowerCase().includes(q.toLowerCase()))
        : games,
    [q],
  )

  const finish = (fn: () => void) => {
    onOpenChange(false)
    setQuery("")
    fn()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setQuery("")
      }}
      title="搜索"
      description="搜索作品、角色、游戏或标签"
      className="top-[12vh] rounded-2xl! sm:max-w-[640px]"
    >
      <Command shouldFilter={false} className="rounded-2xl!">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="搜索作品、角色、游戏或标签"
          className="h-11 text-[15px]"
        />
        <CommandList className="max-h-[min(62vh,520px)] p-1">
          {q && <CommandEmpty className="py-12 text-muted-foreground">没有找到「{q}」，换个角色名或标签试试。</CommandEmpty>}

          {!q && (
            <CommandGroup heading="试试搜索">
              <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="focus-frame h-8 rounded-full border px-3 text-[13px] text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CommandGroup>
          )}

          {matchedGames.length > 0 && (
            <CommandGroup heading="游戏">
              {matchedGames.map((g) => (
                <CommandItem
                  key={g.slug}
                  value={`game-${g.slug}`}
                  onSelect={() => finish(() => navigate(`/g/${g.slug}`))}
                  className="gap-3 py-2"
                >
                  <img src={g.tile} alt="" className="size-9 rounded-lg object-cover" />
                  <span className="flex flex-col">
                    <span>{g.name}</span>
                    <span className="text-xs text-muted-foreground">{g.en}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.length > 0 && (
            <CommandGroup heading={`作品 ${results.length}`}>
              {results.slice(0, 8).map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.id}
                  onSelect={() => finish(() => viewer.open(w.id, results.map((r) => r.id)))}
                  className="gap-3 py-2"
                >
                  <span className="grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-card">
                    <img src={w.thumb} alt="" loading="lazy" className="size-full object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {w.title}
                      <span className="ml-2 text-muted-foreground">{w.character}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getGame(w.game)!.name}
                      <span className="mx-1.5 text-faint">/</span>
                      {w.orientation === "landscape" ? "横版" : "竖版"} {resolutionClass(w.width, w.height)}
                    </span>
                  </span>
                </CommandItem>
              ))}
              {results.length > 1 && (
                <CommandItem
                  value="see-all"
                  onSelect={() => finish(() => navigate(`/search?q=${encodeURIComponent(q)}`))}
                  className="mt-1 gap-3 py-2.5"
                >
                  <span className="grid h-10 w-16 place-items-center">
                    <SearchIcon className="text-muted-foreground" />
                  </span>
                  查看全部 {results.length} 个结果
                  <ArrowRightIcon className="ml-auto text-muted-foreground" />
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
