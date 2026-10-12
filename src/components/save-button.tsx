import { HeartIcon } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useSaved } from "@/lib/favorites"
import { cn } from "@/lib/utils"

export function SaveButton({
  id,
  className,
  variant = "secondary",
}: {
  id: string
  className?: string
  variant?: "secondary" | "ghost"
}) {
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(id)
  return (
    <Button
      variant={variant}
      size="icon-lg"
      aria-pressed={saved}
      aria-label={saved ? "取消收藏" : "收藏"}
      onClick={() => {
        const now = toggle(id)
        toast(now ? "已加入收藏" : "已移出收藏", {
          description: now ? "收藏保存在这台设备的浏览器里" : undefined,
        })
      }}
      className={cn("rounded-full", className)}
    >
      <motion.span
        key={String(saved)}
        initial={{ scale: saved ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 18 }}
        className="grid place-items-center"
      >
        <HeartIcon className={cn("size-[18px]", saved && "fill-current")} />
      </motion.span>
    </Button>
  )
}
