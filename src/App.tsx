import { useEffect, useState } from "react"
import { Route, Routes, useLocation } from "react-router"
import { MotionConfig } from "motion/react"

import { SearchDialog } from "@/components/search-dialog"
import { SiteFooter } from "@/components/site-footer"
import { TopBar } from "@/components/top-bar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Viewer } from "@/components/viewer"
import { ViewerProvider } from "@/lib/viewer"
import { SavedPage, SearchPage } from "@/pages/collection"
import { HomePage } from "@/pages/home"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.closest("input, textarea, [contenteditable=true]")
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <ViewerProvider>
          <ScrollToTop />
          <TopBar onSearch={() => setSearchOpen(true)} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/g/:slug" element={<HomePage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <SiteFooter />
          <Viewer />
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          <Toaster position="bottom-center" />
        </ViewerProvider>
      </TooltipProvider>
    </MotionConfig>
  )
}
