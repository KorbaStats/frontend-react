import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Star, Trophy } from "lucide-react";

import type { League } from "@/data/types";
import type { MatchFilters } from "@/lib/matchFilters";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import { getLeagues } from "@/services/leaguesService";
import { getAvailableSeasons } from "@/services/matchesService";

import SidebarSection from "@/components/layout/SidebarSection";
import MatchesFilters from "@/components/filters/MatchesFilters";
import TeamWeatherFilters from "@/components/filters/TeamWeatherFilters";

const FavouriteTeams = () => (
  <SidebarSection icon={Star} title="Ulubione drużyny">
    <p className="text-center text-sm text-muted-foreground">
      Brak ulubionych drużyn
    </p>
    {/* TODO: */}
  </SidebarSection>
);

const Leagues = ({ leagues }: { leagues: League[] }) => {
  const navigate = useNavigate();
  return (
    <SidebarSection icon={Trophy} title="Ligi">
      <ul className="flex flex-col gap-1">
        {leagues.map((league) => (
          <li key={league.id}>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-colors hover:cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => navigate(`/league/${league.id}`)}
            >
              <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded-md bg-accent/50 text-[10px] font-semibold tracking-wide text-muted-foreground">
                {getLeagueCountryCode(league)}
              </span>
              <span>{league.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
};

interface SidebarProps {
  filters: MatchFilters;
  onFiltersChange: (next: MatchFilters) => void;
}

const Sidebar = ({ filters, onFiltersChange }: SidebarProps) => {
  const { pathname } = useLocation();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);

  // ligi służą i sekcji nawigacyjnej, i dropdownowi w filtrach
  useEffect(() => {
    getLeagues().then((res) => setLeagues(res.data));
    getAvailableSeasons().then(setSeasons);
  }, []);

  // "/teams" (lista) filtrów nie ma, tylko strona konkretnej drużyny
  const showMatchesFilters = pathname === "/matches";
  const showTeamFilters = pathname.startsWith("/team/");

  return (
    <aside className="no-scrollbar sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 flex-col gap-4 overflow-y-auto px-6 py-4 lg:flex xl:w-96">
      {showMatchesFilters && (
        <MatchesFilters
          value={filters}
          onChange={onFiltersChange}
          seasons={seasons}
          leagues={leagues}
        />
      )}

      {showTeamFilters && (
        <TeamWeatherFilters
          value={filters}
          onChange={(bands) => onFiltersChange({ ...filters, ...bands })}
        />
      )}

      <FavouriteTeams />
      <Leagues leagues={leagues} />
    </aside>
  );
};

export default Sidebar;
