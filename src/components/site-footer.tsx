import { Link } from "react-router"

import { Wordmark } from "@/components/brand"
import { games, wallpapers } from "@/lib/catalog"

export function SiteFooter() {
  const uhd = wallpapers.filter((w) => w.isUHD).length
  return (
    <footer className="mx-auto mt-28 w-full max-w-[1680px] px-5 pb-12 sm:px-10 lg:px-14">
      <div className="flex flex-col gap-10 border-t pt-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            为值得按下暂停的游戏画面而建。目前收录 {wallpapers.length} 幅作品，其中 {uhd} 幅提供 4K 原图。
          </p>
        </div>
        <nav aria-label="游戏" className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm sm:grid-cols-3">
          {games.map((g) => (
            <Link key={g.slug} to={`/g/${g.slug}`} className="focus-frame rounded text-muted-foreground transition-colors hover:text-foreground">
              {g.name}
            </Link>
          ))}
          <Link to="/saved" className="focus-frame rounded text-muted-foreground transition-colors hover:text-foreground">
            我的收藏
          </Link>
        </nav>
      </div>
      <p className="mt-12 text-xs leading-relaxed text-faint">
        游戏名称与角色版权归各自权利方所有。作品仅供个人设备壁纸使用，请勿用于商业用途。
      </p>
    </footer>
  )
}
