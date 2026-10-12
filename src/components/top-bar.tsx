import { useState } from "react"
import { Link, NavLink, useLocation } from "react-router"
import { useMotionValueEvent, useScroll } from "motion/react"
import { HeartIcon, SearchIcon } from "lucide-react"

import { Wordmark } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useSaved } from "@/lib/favorites"
import { cn } from "@/lib/utils"

const tab =
  "focus-frame relative rounded-full px-1 py-1 text-[15px] transition-colors after:absolute after:inset-x-1 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity"

export function TopBar({ onSearch }: { onSearch: () => void }) {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const { saved } = useSaved()
  const { pathname } = useLocation()
  const gamesActive = pathname === "/" || pathname.startsWith("/g/")
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 48
    if (next !== solid) setSolid(next)
  })

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-500",
        solid ? "bg-background/92 shadow-[0_1px_0_var(--border)]" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1680px] items-center gap-6 px-5 sm:h-16 sm:gap-10 sm:px-10 lg:px-14">
        <Link to="/" aria-label="STILLFRAME 首页" className="focus-frame rounded-md">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 sm:flex">
          <Link
            to="/"
            className={cn(
              tab,
              gamesActive ? "font-medium text-foreground after:opacity-100" : "text-foreground/60 hover:text-foreground",
            )}
          >
            游戏
          </Link>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              cn(tab, isActive ? "font-medium text-foreground after:opacity-100" : "text-foreground/60 hover:text-foreground")
            }
          >
            收藏
            {saved.length > 0 && <span className="tabular ml-1.5 text-xs text-muted-foreground">{saved.length}</span>}
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={onSearch}
            className="hidden h-9 gap-2.5 rounded-full bg-white/8 pr-2 pl-3.5 text-[13px] font-normal text-foreground/75 hover:bg-white/14 hover:text-foreground md:inline-flex"
          >
            <SearchIcon data-icon="inline-start" />
            搜索作品、角色
            <Kbd className="ml-4 bg-white/10 text-foreground/70">⌘K</Kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="搜索"
            onClick={onSearch}
            className="rounded-full hover:bg-white/10 md:hidden"
          >
            <SearchIcon className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-lg" asChild className="rounded-full hover:bg-white/10 sm:hidden">
            <Link to="/saved" aria-label={`收藏，${saved.length} 幅`}>
              <HeartIcon className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
