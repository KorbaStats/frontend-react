import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { FiltersOutletContext } from "@/components/layout/MainLayout";

import MatchesTable from "@/components/shared/MatchesTable";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";

const EMPTY: MatchWithWeather[] = [];

const Matches = () => {
  const {data: matches = EMPTY, isPending, isError } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => (await getMatches()).data,
  });

  const { filters } = useOutletContext<FiltersOutletContext>();
  const filteredMatches = useMemo(
    () => filterMatches(matches, filters),
    [matches, filters],
  );

  const {visibleItems, hiddenCount, showMore, reset} = useVisibleItems(filteredMatches);
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
        {isPending && (
          <p className="py-10 text-center text-muted-foreground">
            Ładowanie...
          </p>
        )}

        {isError && (
          <p className="py-10 text-center text-muted-foreground">Nie udało się pobrać meczów</p>
        )}

        {!isPending && !isError && (
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
