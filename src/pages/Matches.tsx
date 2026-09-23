import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

import { getMatches, type MatchWithWeather } from "@/services/matchesService";
import { filterMatches } from "@/lib/matchFilters";
import type { FiltersContext } from "@/components/layout/MainLayout";

import MatchesTable from "@/components/shared/MatchesTable";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";


const Matches = () => {
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtry ustawiane w sidebarze, stan trzyma MainLayout
  const { filters } = useOutletContext<FiltersContext>();

  useEffect(() => {
    getMatches()
      .then((response) => setMatches(response.data))
      .catch((err) => {
        setError("Nie udało sie pobrać meczów");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMatches = useMemo(
    () => filterMatches(matches, filters),
    [matches, filters],
  );

  // własny hook obsługujący paginację
  const {visibleItems, hiddenCount, showMore, reset} = useVisibleItems(filteredMatches);

  // zawężenie listy cofa paginację na początek
  useEffect(() => reset(), [filters, reset]);
  
  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Wszystkie mecze
        </CardTitle>
        <CardDescription>
          Pokazano {filteredMatches.length} z {matches.length} meczów
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
  );
};

export default Matches;
