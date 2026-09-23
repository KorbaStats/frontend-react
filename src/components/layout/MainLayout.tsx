import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router"

import type { MatchFilters } from "@/lib/matchFilters"
import { emptyFilters } from "@/lib/matchFilters"

import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

export type FiltersContext = {
  filters: MatchFilters
  setFilters: (next: MatchFilters) => void
}

const MainLayout = () => {
  const { pathname } = useLocation()
  const [stored, setStored] = useState({ pathname, filters: emptyFilters })
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const isSidebarOpen = openedOn === pathname
  const setIsSidebarOpen = (open: boolean) => setOpenedOn(open ? pathname : null)

  const filters = stored.pathname === pathname ? stored.filters : emptyFilters
  const setFilters = (next: MatchFilters) => setStored({ pathname, filters: next })

  // Escape zamyka szufladę
  useEffect(() => {
    if (!isSidebarOpen) return
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null)
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isSidebarOpen])

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="mx-auto flex w-full max-w-400">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 px-6 py-4 2xl:pl-3">
          <Outlet context={{ filters, setFilters } satisfies FiltersContext} />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
