import { useState } from "react"
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

  // zmiana adresu czyści filtry
  const filters = stored.pathname === pathname ? stored.filters : emptyFilters
  const setFilters = (next: MatchFilters) => setStored({ pathname, filters: next })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex w-full max-w-400">
        <Sidebar filters={filters} onFiltersChange={setFilters} />
        <main className="flex min-w-0 flex-1 flex-col gap-4 px-6 py-4">
          <Outlet context={{ filters, setFilters } satisfies FiltersContext} />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
