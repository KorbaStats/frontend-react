import { useState } from "react";
import { Outlet, useLocation } from "react-router";

import type { MatchFilters } from "@/lib/matchFilters";
import { emptyFilters } from "@/lib/matchFilters";
import type { LayoutContext } from "@/hooks/useLayoutFilters";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const MainLayout = () => {
  const { pathname } = useLocation();

  const [stored, setStored] = useState({ pathname, filters: emptyFilters });

  // zmiana adresu resetuje filtry
  const filters = stored.pathname === pathname ? stored.filters : emptyFilters;
  const setFilters = (next: MatchFilters) =>
    setStored({ pathname, filters: next });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex w-full flex-col lg:flex-row">
        <Sidebar filters={filters} onFiltersChange={setFilters} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto flex w-full max-w-280 flex-col gap-4 px-6 py-4">
            <Outlet context={{ filters, setFilters } satisfies LayoutContext} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
