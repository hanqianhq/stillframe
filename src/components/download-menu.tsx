import type { ReactNode } from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Wallpaper } from "@/lib/catalog"
import { formatBytes, formatResolution, resolutionClass } from "@/lib/format"

const hints: Record<string, string> = {
  original: "未经压缩，保留全部细节",
  jpg: "画质几乎无损，体积更小",
  qhd: "适合 2K 屏与笔记本",
}

export function DownloadMenu({
  wallpaper,
  children,
  align = "start",
  side = "top",
}: {
  wallpaper: Wallpaper
  children: ReactNode
  align?: "start" | "end" | "center"
  side?: "top" | "bottom"
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={10}
        className="w-[300px] rounded-2xl p-1.5"
      >
        <DropdownMenuLabel className="px-2.5 pt-2 pb-1.5 text-xs font-normal text-muted-foreground">
          选择下载版本
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {wallpaper.downloads.map((d) => (
            <DropdownMenuItem key={d.key} asChild className="rounded-xl px-2.5 py-2.5">
              <a
                href={d.url}
                download={d.filename}
                onClick={() =>
                  toast(`开始下载 ${wallpaper.title}`, {
                    description: `${formatResolution(d.width, d.height)} ${d.format}，${formatBytes(d.bytes)}`,
                  })
                }
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 grid h-6 min-w-9 place-items-center rounded-md bg-secondary px-1.5 text-[11px] font-semibold tracking-wide">
                  {d.key === "original" ? resolutionClass(d.width, d.height) : d.format}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{d.label}</span>
                    <span className="tabular text-xs text-muted-foreground">{formatBytes(d.bytes)}</span>
                  </span>
                  <span className="tabular text-xs text-foreground/70">
                    {formatResolution(d.width, d.height)} {d.format}
                  </span>
                  <span className="text-xs text-faint">{hints[d.key]}</span>
                </span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <p className="flex items-center gap-2 px-2.5 py-2 text-[11px] leading-relaxed text-faint">
          <DownloadIcon className="size-3.5 shrink-0" />
          仅供个人设备壁纸使用
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
