import { History } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { MatchWithWeather } from "@/services/matchesService";
import { useVisibleItems } from "@/hooks/useVisibleItems";

import MatchesTable from "@/components/shared/MatchesTable";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";

interface LeagueRecentMatchesProps {
  matches: MatchWithWeather[];
  season: string | null;
  leagueName: string | null;
  pageSize?: number;
}

const LeagueRecentMatches = ({
  matches,
  season,
  leagueName,
  pageSize = 10,
}: LeagueRecentMatchesProps) => {
  // mecze przychodzą z serwisu posortowane od najnowszych
  const { visibleItems, hiddenCount, showMore } = useVisibleItems(
    matches,
    pageSize,
  );

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          {leagueName ? `Ostatnie mecze w ${leagueName}` : "Ostatnie mecze"}
        </CardTitle>
        <CardDescription>
          {season
            ? `Mecze w sezonie ${season} z panującymi warunkami pogodowymi`
            : "Mecze w lidze z panującymi warunkami pogodowymi"}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <div className="overflow-x-auto print:overflow-visible">
          <MatchesTable matches={visibleItems} />
        </div>
      </CardContent>

      <ShowMoreFooter hiddenCount={hiddenCount} onClick={showMore} />
    </Card>
  );
};

export default LeagueRecentMatches;
