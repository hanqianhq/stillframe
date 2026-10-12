import raw from "@/data/catalog.json"

export type GameSlug = "nier" | "wow" | "zzz" | "genshin" | "lol"

export interface Game {
  slug: GameSlug
  name: string
  en: string
  blurb: string
  tile: string
  coverId: string
}

export interface DownloadVariant {
  key: "original" | "jpg" | "qhd"
  label: string
  format: string
  width: number
  height: number
  bytes: number
  url: string
  filename: string
}

export interface Wallpaper {
  id: string
  game: GameSlug
  title: string
  character: string
  tags: string[]
  featured: boolean
  width: number
  height: number
  orientation: "landscape" | "portrait"
  isUHD: boolean
  tint: string
  luminance: number
  focus: [number, number]
  addedAt: number
  lqip: string
  thumb: string
  large: string
  downloads: DownloadVariant[]
}

const data = raw as unknown as { games: Game[]; wallpapers: Wallpaper[] }

export const games: Game[] = data.games
export const wallpapers: Wallpaper[] = [...data.wallpapers].sort(
  (a, b) => b.addedAt - a.addedAt,
)

const byId = new Map(wallpapers.map((w) => [w.id, w]))
const gameBySlug = new Map(games.map((g) => [g.slug, g]))

export function getWallpaper(id: string | null | undefined) {
  return id ? byId.get(id) : undefined
}

export function getGame(slug: string | null | undefined) {
  return slug ? gameBySlug.get(slug as GameSlug) : undefined
}

export function wallpapersOf(slug: GameSlug | undefined) {
  return slug ? wallpapers.filter((w) => w.game === slug) : wallpapers
}

/** Landscape only: featured first, then newest. These drive the hero. */
export function heroPicks(slug: GameSlug | undefined, limit = 8) {
  const pool = wallpapersOf(slug).filter((w) => w.orientation === "landscape")
  if (!slug) {
    const covers = games.map((g) => byId.get(g.coverId)!).filter(Boolean)
    const rest = pool.filter((w) => w.featured && !covers.includes(w))
    return [...covers, ...rest].slice(0, limit)
  }
  const featured = pool.filter((w) => w.featured)
  const cover = byId.get(gameBySlug.get(slug)!.coverId)
  const ordered = cover
    ? [cover, ...featured.filter((w) => w !== cover)]
    : featured
  const rest = pool.filter((w) => !ordered.includes(w))
  return [...ordered, ...rest].slice(0, limit)
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[\s·・/:：\-]/g, "")
}

const searchIndex = wallpapers.map((w) => {
  const g = gameBySlug.get(w.game)!
  return {
    w,
    hay: normalize(
      [w.title, w.character, ...w.tags, g.name, g.en, w.isUHD ? "4k 原图 高清" : "", w.orientation === "portrait" ? "竖版 手机 竖屏" : "横版 电脑 桌面 横屏"].join(" "),
    ),
  }
})

export function searchWallpapers(query: string) {
  const terms = query
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean)
  if (!terms.length) return []
  return searchIndex
    .filter(({ hay }) => terms.every((t) => hay.includes(t)))
    .map(({ w }) => w)
}

export const characters = (slug?: GameSlug) => {
  const counts = new Map<string, number>()
  for (const w of wallpapersOf(slug)) {
    for (const c of w.character.split(" / ")) {
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
