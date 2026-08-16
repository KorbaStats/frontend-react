import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

import { getMatches, type MatchWithWeather } from "@/services/matchesService";
import { getLeagues } from "@/services/leaguesService";
import type { LeagueWithFlag } from "@/data/leagues";

import {
  emptyFilters,
  filterMatches,
  getSeasons,
  type MatchFilters,
} from "@/lib/matchFilters";

import MatchesTable from "@/components/shared/MatchesTable";
import MatchesFiltersCard from "@/components/matches/MatchesFiltersCard";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";


const Matches = () => {
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [leagues, setLeagues] = useState<LeagueWithFlag[]>([]);
  const [filters, setFilters] = useState<MatchFilters>(emptyFilters);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMatches(), getLeagues()])
      .then(([matchesResponse, leaguesResponse]) => {
        setMatches(matchesResponse.data);
        setLeagues(leaguesResponse.data);
      })
      .catch((err) => {
        setError("Nie udało sie pobrać meczów");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // both derive from data already in state — no reason to refetch on filtering
  const seasons = useMemo(() => getSeasons(matches), [matches]);
  const filteredMatches = useMemo(
    () => filterMatches(matches, filters),
    [matches, filters],
  );

  // calling custom hook to serve pagination
  const {visibleItems, hiddenCount, showMore, reset} = useVisibleItems(filteredMatches);


  // narrowing the list should always drop you back to the first page — done
  // here rather than in an effect, since it reacts to the event, not to state
  const handleFiltersChange = (next: MatchFilters) => {
    setFilters(next);
    reset();
  };

  return (
    <>
      {/* Filtry */}
      <MatchesFiltersCard
        value={filters}
        onChange={handleFiltersChange}
        seasons={seasons}
        leagues={leagues}
        shownCount={filteredMatches.length}
        totalCount={matches.length}
      />

      {/* Lista meczy */}
      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h4- w-4 text-primary" />
            Wszystkie mecze
          </CardTitle>
          <CardDescription>
            Rozegrane mecze z panującymi warunkami pogodowymi
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Ładowanie...
            </p>
          )}

          {error && (
            <p className="py-10 text-center text-muted-foreground">{error}</p>
          )}

          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <MatchesTable matches={visibleItems} />
            </div>
          )}
        </CardContent>

        <ShowMoreFooter hiddenCount={hiddenCount} onClick={showMore} />
      </Card>
    </>
  );
};

export default Matches;
