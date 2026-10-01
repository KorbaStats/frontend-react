import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Star, Trophy } from "lucide-react";

import type { Team, League } from "@/data/types";
import type { MatchFilters } from "@/lib/matchFilters";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import { getLeagues } from "@/services/leaguesService";
import { getAvailableSeasons } from "@/services/matchesService";
import { getTeams } from "@/services/teamsService";

import SidebarSection from "@/components/layout/SidebarSection";
import MatchesFilters from "@/components/filters/MatchesFilters";
import TeamWeatherFilters from "@/components/filters/TeamWeatherFilters";
import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";
import FavouriteStar from "../shared/FavouriteStar";

const FavouriteTeams = ({ teams }: { teams: Team[] }) => (
  <SidebarSection icon={Star} title="Ulubione drużyny">
    {teams.length === 0 ? (
      <p className="text-center text-sm text-muted-foreground">
        Brak ulubionych drużyn do wyświetlenia.
      </p>
    ) : (
      <ul className="flex flex-col gap-1">
        {teams.map((team) => (
          <li
            key={team.id}
            className="group flex items-center gap-2 rounded-xl pr-1 transition-colors hover:bg-accent"
          >
            <Link
              to={`/team/${team.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-sm font-medium group-hover:text-accent-foreground"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
                {team.short_name}
              </span>
              <span className="truncate">{team.name}</span>
            </Link>

            <FavouriteStar
              teamId={team.id}
              className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            />
          </li>
        ))}
      </ul>
    )}
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
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}: SidebarProps) => {
  const { pathname } = useLocation();
  // favourite teams ids from context api
  const { favouriteTeamsIds } = useFavouriteTeams();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const favouriteTeams = teams.filter((t) => favouriteTeamsIds.includes(t.id));

  // ligi służą i sekcji nawigacyjnej, i dropdownowi w filtrach
  useEffect(() => {
    getTeams()
      .then((res) => setTeams(res.data))
      .catch(console.error);
    getLeagues()
      .then((res) => setLeagues(res.data))
      .catch(console.error);
    getAvailableSeasons().then(setSeasons).catch(console.error);
  }, []);

  const showMatchesFilters = pathname === "/matches";
  const showTeamFilters = pathname.startsWith("/team/");

  const sections = (
    <>
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

      <FavouriteTeams teams={favouriteTeams} />
      <Leagues leagues={leagues} />
    </>
  );

  return (
    <>
      <aside className="no-scrollbar sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 flex-col gap-4 overflow-y-auto py-4 pr-3 pl-6 2xl:flex print:hidden">
        {sections}
      </aside>

      <div
        className={`fixed inset-0 top-16 z-40 2xl:hidden print:hidden ${
          isOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`no-scrollbar absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-4 overflow-y-auto border-r bg-background px-4 py-4 shadow-xl transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sections}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
