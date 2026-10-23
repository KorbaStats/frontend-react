import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import type { ScheduledMatch } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";
import { getUpcomingMatchesForTeams } from "@/services/scheduledMatchesService";

import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";
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
import UpcomingMatchesCard from "@/components/dashboard/UpcomingMatchesCard";
import WinsByWeatherChart from "@/components/dashboard/WinsByWeatherChart";
import RecentMatchesCard from "@/components/dashboard/RecentMatchesCard";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_SCHEDULED: ScheduledMatch[] = [];
const RECENT_LIMIT = 10;

const Dashboard = () => {
  const { favouriteTeamsIds, isLoadingFavourites } = useFavouriteTeams();

  const matchesQuery = useQuery(matchesOptions);
  const seasonsQuery = useQuery(seasonsOptions);

  const summaryQuery = useQuery({
    queryKey: ["match-stats", "summary"],
    queryFn: getMatchStatsSummary,
  });

  const upcomingMatchesQuery = useQuery({
    queryKey: ["scheduled-matches", [...favouriteTeamsIds].sort((a, b) => a - b)],
    queryFn: () => getUpcomingMatchesForTeams(favouriteTeamsIds),
    enabled: !isLoadingFavourites,
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
    () => computeTopWeatherScores(seasonMatches),
    [seasonMatches],
  );
  const bottomScores = useMemo(
    () => computeBottomWeatherScores(seasonMatches),
    [seasonMatches],
  );

  const seasonLabel = `Wszystkie ligi${season ? `, sezon ${season}` : ""}`;

return (
    <>
      <SummaryCards
        summary={summaryQuery.data}
        extremes={extremes}
        difficultShare={difficultShare}
        isPending={summaryQuery.isPending || matchesQuery.isPending}
        isError={summaryQuery.isError || matchesQuery.isError}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] xl:grid-cols-[2fr_1fr]">
        <UpcomingMatchesCard
          matches={upcomingMatchesQuery.data ?? EMPTY_SCHEDULED}
          isPending={isLoadingFavourites || upcomingMatchesQuery.isPending}
          isError={upcomingMatchesQuery.isError}
          hasFavourites={favouriteTeamsIds.length > 0}
        />
        <WinsByWeatherChart matches={seasonMatches} season={season} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WeatherScoreRankingCard
          Icon={TrendingUp}
          scores={topScores}
          title="Najlepsze Weather Score's"
          description={seasonLabel}
        />
        <WeatherScoreRankingCard
          Icon={TrendingDown}
          iconColor="text-destructive"
          scores={bottomScores}
          title="Najsłabsze Weather Score's"
          description={seasonLabel}
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
