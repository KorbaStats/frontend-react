import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { getMatchStatsSummary } from "@/services/matchStatsService";

import { matchesOptions, seasonsOptions } from "@/hooks/queries";
import {
  computeTopWeatherScores,
  computeBottomWeatherScores,
} from "@/lib/leagueWeather";
import {
  computeDifficultWeatherShare,
  computeWeatherExtremes,
} from "@/lib/weatherStats";

import SummaryCards from "@/components/dashboard/SummaryCards";
import WinsByWeatherChart from "@/components/dashboard/WinsByWeatherChart";
import RecentMatchesCard from "@/components/dashboard/RecentMatchesCard";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";
const EMPTY_MATCHES: MatchWithWeather[] = [];
const RECENT_LIMIT = 10;

const Dashboard = () => {
  const matchesQuery = useQuery(matchesOptions);
  const seasonsQuery = useQuery(seasonsOptions);

  const summaryQuery = useQuery({
    queryKey: ["match-stats", "summary"],
    queryFn: getMatchStatsSummary,
  });

  const allMatches = matchesQuery.data ?? EMPTY_MATCHES;
  const season = seasonsQuery.data?.[0] ?? null;

  const seasonMatches = useMemo(
    () => (season ? allMatches.filter((m) => m.season === season) : allMatches),
    [allMatches, season],
  );
  const extremes = useMemo(
    () => computeWeatherExtremes(allMatches),
    [allMatches],
  );
  const difficultShare = useMemo(
    () => computeDifficultWeatherShare(allMatches),
    [allMatches],
  );
  const recentMatches = useMemo(
    () => allMatches.slice(0, RECENT_LIMIT),
    [allMatches],
  );
  const topScores = useMemo(
    () => computeTopWeatherScores(allMatches),
    [allMatches],
  );
  const bottomScores = useMemo(
    () => computeBottomWeatherScores(allMatches),
    [allMatches],
  );

  const scoresLabel = "Wszystkie ligi i sezony";

return (
    <>
      <SummaryCards
        summary={summaryQuery.data}
        extremes={extremes}
        difficultShare={difficultShare}
        isPending={summaryQuery.isPending || matchesQuery.isPending}
        isError={summaryQuery.isError || matchesQuery.isError}
      />

      <div className="grid grid-cols-3 gap-4">
        <WinsByWeatherChart matches={seasonMatches} season={season} />
        <WeatherScoreRankingCard
          Icon={TrendingUp}
          scores={topScores}
          title="Najlepsze Weather Score's"
          description={scoresLabel}
        />
        <WeatherScoreRankingCard
          Icon={TrendingDown}
          iconColor="text-destructive"
          scores={bottomScores}
          title="Najsłabsze Weather Score's"
          description={scoresLabel}
        />
      </div>

      <RecentMatchesCard
        matches={recentMatches}
        isPending={matchesQuery.isPending}
        isError={matchesQuery.isError}
      />
    </>
  );
};

export default Dashboard;
