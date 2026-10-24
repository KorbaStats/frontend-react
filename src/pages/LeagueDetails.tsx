import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";

import {
  getLeagueMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import {
  leaguesOptions,
  matchesOptions,
  seasonsOptions,
} from "@/hooks/queries";

import {
  computeLeagueWeatherSummary,
  computeTopWeatherScores,
} from "@/lib/leagueWeather";

import LeagueHeader from "@/components/league-details/LeagueHeader";
import LeagueTable from "@/components/league-details/LeagueTable";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";
import LeagueRecentMatches from "@/components/league-details/LeagueRecentMatches";
import WeatherComparisonChart from "@/components/shared/WeatherComparisonChart";
import ExportReportButton from "@/components/shared/ExportReportButton";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_SEASONS: string[] = [];

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

  const allMatchesQuery = useQuery(matchesOptions);

  const league = leagueQuery.data ?? null;
  const leagueMatches = matchesQuery.data ?? EMPTY_MATCHES;
  const allMatches = allMatchesQuery.data ?? EMPTY_MATCHES;

  const isPending =
    leagueQuery.isPending ||
    seasonsQuery.isPending ||
    matchesQuery.isPending ||
    allMatchesQuery.isPending;
  const isError =
    leagueQuery.isError ||
    seasonsQuery.isError ||
    matchesQuery.isError ||
    allMatchesQuery.isError ||
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
    () =>
      computeTopWeatherScores(
        allMatches.filter((m) => m.league_id === leagueId),
      ),
    [allMatches, leagueId],
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
          scores={topScores}
          title="Top Weather Score's w lidze"
          description="Najlepsze drużyny w trudnej pogodzie — wszystkie sezony"
        />
      </div>

      <WeatherComparisonChart
        matches={leagueMatches}
        title="Wpływ warunków pogodowych"
        description={`${league?.name ?? "Liga"}${
          selectedSeason ? `, sezon ${selectedSeason}` : ""
        } — statystyki względem meczów w sprzyjających warunkach pogodowych.`}
      />

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
