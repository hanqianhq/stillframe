import { useEffect, useMemo, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router"
import { HeartIcon, SearchXIcon } from "lucide-react"

import { Gallery } from "@/components/gallery"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getWallpaper, searchWallpapers, type Wallpaper } from "@/lib/catalog"
import { useSaved } from "@/lib/favorites"

function PageShell({ heading, sub, children }: { heading: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-[70svh] pt-28 sm:pt-36">
      <div className="mx-auto mb-10 w-full max-w-[1680px] px-5 sm:px-10 lg:px-14">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{heading}</h1>
        {sub && <p className="mt-3 max-w-[60ch] text-[15px] text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function EmptyBlock({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-10 lg:px-14">
      <Empty className="rounded-3xl border border-dashed py-24">
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild className="rounded-full px-5">
            <Link to="/">去看看各游戏精选</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function SavedPage() {
  const { saved } = useSaved()
  const items = useMemo(() => saved.map(getWallpaper).filter(Boolean) as Wallpaper[], [saved])
  useEffect(() => {
    document.title = "我的收藏 | STILLFRAME 静帧"
  }, [])
  return (
    <PageShell heading="我的收藏" sub="收藏只保存在这台设备的浏览器里，无需登录。">
      <Gallery
        title="已收藏"
        items={items}
        showGame
        empty={
          <EmptyBlock
            icon={<HeartIcon />}
            title="还没有收藏"
            description="在大图里点一下心形，作品就会出现在这里。"
          />
        }
      />
    </PageShell>
  )
}

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get("q")?.trim() ?? ""
  const items = useMemo(() => searchWallpapers(q), [q])
  useEffect(() => {
    document.title = `${q ? `「${q}」` : "搜索"} | STILLFRAME 静帧`
  }, [q])
  return (
    <PageShell heading={q ? `「${q}」` : "搜索"} sub={q ? `在 ${new Set(items.map((w) => w.game)).size} 款游戏中找到 ${items.length} 幅作品` : undefined}>
      <Gallery
        key={q}
        title="搜索结果"
        items={items}
        showGame
        empty={
          <EmptyBlock
            icon={<SearchXIcon />}
            title="没有找到相关作品"
            description="试试角色名、游戏名，或者「4K」「竖版」「黄昏」这样的标签。"
          />
        }
      />
    </PageShell>
  )
}
