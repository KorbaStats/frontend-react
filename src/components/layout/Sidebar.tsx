import { useLocation } from "react-router";

import type { MatchFilters } from "@/lib/matchFilters";
import { cn } from "@/lib/utils";

import FiltersSidebar from "@/components/layout/sidebar-type/FiltersSidebar";
import NavSidebar from "@/components/layout/sidebar-type/NavSidebar";

interface SidebarProps {
  filters: MatchFilters;
  onFiltersChange: (next: MatchFilters) => void;
}

const Sidebar = ({ filters, onFiltersChange }: SidebarProps) => {
  const { pathname } = useLocation();

  const isMatchesList = pathname === "/matches";
  // "/teams" (lista) nie łapie się na filtry
  const isTeamPage = pathname.startsWith("/team/");
  const showFilters = isMatchesList || isTeamPage;

  return (
    <aside
      className={cn(
        "shrink-0 px-6 py-4 lg:sticky lg:top-16 lg:min-h-[calc(100vh-4rem)] lg:w-80 lg:self-start lg:border-r xl:w-88 ",
        showFilters ? "border-b lg:border-b-0" : "hidden lg:block",
      )}
    >
      {showFilters ? (
        <FiltersSidebar
          value={filters}
          onChange={onFiltersChange}
          showMatchFields={isMatchesList}
        />
      ) : (
        <NavSidebar />
      )}
    </aside>
  );
};

export default Sidebar;
