import { cn } from "@/lib/utils"

/** A 16:9 frame holding a pause glyph: the moment you stop to look. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      fill="none"
      aria-hidden
      className={cn("h-[14px] w-auto", className)}
    >
      <rect x="1" y="1" width="30" height="18" rx="3.5" stroke="currentColor" strokeWidth="2" />
      <rect x="11.5" y="6" width="2.6" height="8" rx="0.8" fill="currentColor" />
      <rect x="17.9" y="6" width="2.6" height="8" rx="0.8" fill="currentColor" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-[13px] font-semibold tracking-[0.22em]">STILLFRAME</span>
      <span className="hidden text-[13px] text-muted-foreground sm:inline">静帧</span>
    </span>
  )
}
