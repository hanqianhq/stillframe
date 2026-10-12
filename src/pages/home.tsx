import { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router"

import { Gallery } from "@/components/gallery"
import { Hero } from "@/components/hero"
import { getGame, getWallpaper, heroPicks, wallpapersOf, type GameSlug } from "@/lib/catalog"

export function HomePage() {
  const { slug } = useParams()
  const game = getGame(slug)
  const navigate = useNavigate()
  const picks = useMemo(() => heroPicks(game?.slug, 10), [game])
  const [state, setState] = useState({ slug: game?.slug, id: picks[0].id })

  let activeId = state.id
  if (state.slug !== game?.slug) {
    activeId = picks[0].id
    setState({ slug: game?.slug, id: activeId })
  }
  const active = getWallpaper(activeId) ?? picks[0]

  const onActive = useCallback((id: string) => setState((s) => (s.id === id ? s : { ...s, id })), [])
  const onSelectGame = useCallback(
    (s: GameSlug | undefined) => navigate(s ? `/g/${s}` : "/", { preventScrollReset: true }),
    [navigate],
  )

  useEffect(() => {
    document.documentElement.style.setProperty("--tint", active.tint)
  }, [active.tint])

  useEffect(() => {
    document.title = game ? `${game.name}壁纸 | STILLFRAME 静帧` : "STILLFRAME 静帧 | 游戏壁纸"
  }, [game])

  if (slug && !game) return <Navigate to="/" replace />

  return (
    <>
      <Hero
        game={game?.slug}
        picks={picks}
        active={active}
        onActive={onActive}
        onSelectGame={onSelectGame}
      />
      <div
        className="pt-6 sm:pt-10"
        style={{ background: "linear-gradient(to bottom, var(--ambient), var(--background) 560px)" }}
      >
        <Gallery
          key={game?.slug ?? "all"}
          id="works"
          title={game ? "全部作品" : "最新收录"}
          items={wallpapersOf(game?.slug)}
          showCharacters={!!game}
          showGame={!game}
        />
      </div>
    </>
  )
}
