import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import type { Team, TeamWeatherScores, WeatherCategoryKey } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";

import {
  matchesOptions,
  seasonsOptions,
  teamsOptions,
  weatherScoreCategoriesOptions,
  weatherScoresOptions,
} from "@/hooks/queries";
import {
  DEFAULT_RANKING_CATEGORY,
  categoryLabel,
  rankWeatherScores,
} from "@/lib/weatherScore";
import {
  computeDifficultWeatherShare,
  computeWeatherExtremes,
} from "@/lib/weatherStats";

import SummaryCards from "@/components/dashboard/SummaryCards";
import WinsByWeatherChart from "@/components/dashboard/WinsByWeatherChart";
import RecentMatchesCard from "@/components/dashboard/RecentMatchesCard";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";
const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_SCORES: TeamWeatherScores[] = [];
const EMPTY_TEAMS: Team[] = [];
const RECENT_LIMIT = 10;

const Dashboard = () => {
  const matchesQuery = useQuery(matchesOptions);
  const seasonsQuery = useQuery(seasonsOptions);

  const summaryQuery = useQuery({
    queryKey: ["match-stats", "summary"],
    queryFn: getMatchStatsSummary,
  });
  const weatherScoresQuery = useQuery(weatherScoresOptions);
  const teamsQuery = useQuery(teamsOptions);
  const categoriesQuery = useQuery(weatherScoreCategoriesOptions);

  const [topCategory, setTopCategory] = useState<WeatherCategoryKey>(
    DEFAULT_RANKING_CATEGORY,
  );
  const [bottomCategory, setBottomCategory] = useState<WeatherCategoryKey>(
    DEFAULT_RANKING_CATEGORY,
  );

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
  const weatherScores = weatherScoresQuery.data ?? EMPTY_SCORES;
  const teams = teamsQuery.data ?? EMPTY_TEAMS;
  const topScores = useMemo(
    () => rankWeatherScores(weatherScores, teams, topCategory, "best"),
    [weatherScores, teams, topCategory],
  );
  const bottomScores = useMemo(
    () => rankWeatherScores(weatherScores, teams, bottomCategory, "worst"),
    [weatherScores, teams, bottomCategory],
  );

  const scoresPending =
    weatherScoresQuery.isPending || teamsQuery.isPending || categoriesQuery.isPending;
  const scoresError =
    weatherScoresQuery.isError || teamsQuery.isError || categoriesQuery.isError;
  const scoresLabel = (category: WeatherCategoryKey) =>
    `Wszystkie ligi i sezony · ${categoryLabel(categoriesQuery.data, category)}`;

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
          rows={topScores}
          title="Najlepsze Weather Score's"
          description={scoresLabel(topCategory)}
          category={topCategory}
          onCategoryChange={setTopCategory}
          isPending={scoresPending}
          isError={scoresError}
        />
        <WeatherScoreRankingCard
          Icon={TrendingDown}
          iconColor="text-destructive"
          rows={bottomScores}
          title="Najsłabsze Weather Score's"
          description={scoresLabel(bottomCategory)}
          category={bottomCategory}
          onCategoryChange={setBottomCategory}
          isPending={scoresPending}
          isError={scoresError}
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
