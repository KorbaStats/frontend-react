import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router";

import type { MatchFilters } from "@/lib/matchFilters";
import { filtersFromParams, filtersToParams } from "@/lib/matchFilters";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export type FiltersOutletContext = {
  filters: MatchFilters;
  setFilters: (next: MatchFilters) => void;
};

const MainLayout = () => {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isSidebarOpen = openedOn === pathname;
  const setIsSidebarOpen = (open: boolean) =>
    setOpenedOn(open ? pathname : null);

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const setFilters = (next: MatchFilters) =>
    setSearchParams(filtersToParams(next), { replace: true });

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpenedOn(null);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="mx-auto flex w-full max-w-450">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 xl:pl-2">
          <Outlet
            context={
              { filters, setFilters } satisfies FiltersOutletContext
            }
          />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
