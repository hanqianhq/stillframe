import { useState, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

/** Blurred inline placeholder underneath, real image fades in once decoded. */
export function ProgressiveImage({
  src,
  placeholder,
  alt,
  className,
  imgClassName,
  style,
  loading = "lazy",
  fetchPriority,
  fit = "cover",
}: {
  src: string
  placeholder: string
  alt: string
  className?: string
  imgClassName?: string
  style?: CSSProperties
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  fit?: "cover" | "contain"
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === src

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={placeholder}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 size-full scale-110 blur-xl transition-opacity duration-700",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded && "opacity-0",
        )}
        style={style}
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
        onLoad={() => setLoadedSrc(src)}
        className={cn(
          "relative size-full transition-opacity duration-700 ease-out-soft",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        style={style}
      />
    </div>
  )
}
