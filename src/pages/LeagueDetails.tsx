import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";

import type { Team, TeamWeatherScores, WeatherCategoryKey } from "@/data/types";

import {
  getLeagueMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import {
  leagueWeatherScoresOptions,
  leaguesOptions,
  seasonsOptions,
  teamsOptions,
  weatherScoreCategoriesOptions,
} from "@/hooks/queries";

import { computeLeagueWeatherSummary } from "@/lib/leagueWeather";
import {
  DEFAULT_RANKING_CATEGORY,
  categoryLabel,
  rankWeatherScores,
} from "@/lib/weatherScore";

import LeagueHeader from "@/components/league-details/LeagueHeader";
import LeagueTable from "@/components/league-details/LeagueTable";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";
import LeagueRecentMatches from "@/components/league-details/LeagueRecentMatches";
import WeatherComparisonChart from "@/components/shared/WeatherComparisonChart";
import WeatherBandTrendChart from "@/components/league-details/WeatherBandTrendChart";
import ExportReportButton from "@/components/shared/ExportReportButton";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_SEASONS: string[] = [];
const EMPTY_SCORES: TeamWeatherScores[] = [];
const EMPTY_TEAMS: Team[] = [];

const LeagueDetails = () => {
  const { id } = useParams();
  const leagueId = Number(id);

  const [season, setSeason] = useState<string | null>(null);

  const leagueQuery = useQuery({
    ...leaguesOptions,
    select: (leagues) => leagues.find((l) => l.id === leagueId),
  });

  const seasonsQuery = useQuery(seasonsOptions);

  const seasons = seasonsQuery.data ?? EMPTY_SEASONS;
  const selectedSeason = season ?? seasons[0] ?? null;

  const matchesQuery = useQuery({
    queryKey: ["matches", "league", leagueId, selectedSeason],
    queryFn: () => getLeagueMatches(leagueId, selectedSeason ?? undefined),
    enabled: !!selectedSeason,
  });

  const weatherScoresQuery = useQuery(leagueWeatherScoresOptions(leagueId));
  const teamsQuery = useQuery(teamsOptions);
  const categoriesQuery = useQuery(weatherScoreCategoriesOptions);
  const [scoreCategory, setScoreCategory] = useState<WeatherCategoryKey>(
    DEFAULT_RANKING_CATEGORY,
  );

  const league = leagueQuery.data ?? null;
  const leagueMatches = matchesQuery.data ?? EMPTY_MATCHES;
  const weatherScores = weatherScoresQuery.data ?? EMPTY_SCORES;
  const teams = teamsQuery.data ?? EMPTY_TEAMS;

  const isPending =
    leagueQuery.isPending ||
    seasonsQuery.isPending ||
    matchesQuery.isPending;
  const isError =
    leagueQuery.isError ||
    seasonsQuery.isError ||
    matchesQuery.isError ||
    !league;

  const teamsCount = useMemo(
    () =>
      new Set(leagueMatches.flatMap((m) => [m.home_team_id, m.away_team_id]))
        .size,
    [leagueMatches],
  );

  const weatherSummary = useMemo(
    () => computeLeagueWeatherSummary(leagueMatches),
    [leagueMatches],
  );

  const topScores = useMemo(
    () => rankWeatherScores(weatherScores, teams, scoreCategory, "best"),
    [weatherScores, teams, scoreCategory],
  );

  if (isPending) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-destructive">
          Nie udało się pobrać danych ligi.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <LeagueHeader
        league={league}
        seasons={seasons}
        selectedSeason={selectedSeason}
        onSeasonChange={setSeason}
        teamsCount={teamsCount}
        matchesCount={leagueMatches.length}
        weatherSummary={weatherSummary}
      />

      <div className="grid gap-4 grid-cols-3 print:grid-cols-1">
        <LeagueTable matches={leagueMatches} />
        <WeatherScoreRankingCard
          rows={topScores}
          title="Top Weather Score's w lidze"
          description={`Wszystkie sezony · ${categoryLabel(categoriesQuery.data, scoreCategory)}`}
          category={scoreCategory}
          onCategoryChange={setScoreCategory}
          isPending={
            weatherScoresQuery.isPending ||
            teamsQuery.isPending ||
            categoriesQuery.isPending
          }
          isError={
            weatherScoresQuery.isError ||
            teamsQuery.isError ||
            categoriesQuery.isError
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
        <WeatherComparisonChart
          matches={leagueMatches}
          title="Wpływ warunków pogodowych"
          description={`${league?.name ?? "Liga"}${
            selectedSeason ? `, sezon ${selectedSeason}` : ""
          } — statystyki względem meczów w sprzyjających warunkach pogodowych.`}
        />

        <WeatherBandTrendChart
          matches={leagueMatches}
          description={`${league?.name ?? "Liga"}${
            selectedSeason ? `, sezon ${selectedSeason}` : ""
          } — jak zmienia się wybrana statystyka z pogodą.`}
        />
      </div>

      <LeagueRecentMatches
        key={selectedSeason}
        matches={leagueMatches}
        leagueName={league?.name ?? null}
        season={selectedSeason}
      />
      <ExportReportButton
        fileName={`Raport - ${league?.name ?? "liga"} ${selectedSeason ?? ""}`}
      />
    </>
  );
};

export default LeagueDetails;
