import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router";
import { ChartColumn, History } from "lucide-react";

import type { FiltersOutletContext } from "@/components/layout/MainLayout";

import {
  getAvailableSeasons,
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import { getTeamById } from "@/services/teamsService";
import { getTeamWeatherScore } from "@/services/weatherStatsService";

import { computeTeamStats } from "@/lib/teamStats";
import { hasBandFilters, matchesBands } from "@/lib/matchFilters";
import { useVisibleItems } from "@/hooks/useVisibleItems";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MatchesTable from "@/components/shared/MatchesTable";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";
import WeatherScoreCard from "@/components/shared/weather-score/WeatherScoreCard";
import TeamInfoCard from "@/components/team-details/TeamInfoCard";
import TeamStatsCards from "@/components/team-details/TeamStatsCards";
import WeatherComparisonChart from "@/components/shared/WeatherComparisonChart";
import ExportReportButton from "@/components/shared/ExportReportButton";

const EMPTY_MATCHES: MatchWithWeather[] = [];

const TeamDetails = () => {
  const { id } = useParams();
  const teamId = Number(id);
  const { filters } = useOutletContext<FiltersOutletContext>();

  const matchesQuery = useQuery({
    queryKey: ["matches", "team", teamId],
    queryFn: () => getTeamMatches(teamId),
  });

  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeamById(teamId),
  });

  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: getAvailableSeasons,
    staleTime: Infinity,
  });

  const matches = matchesQuery.data ?? EMPTY_MATCHES;
  const team = teamQuery.data;
  const latestSeason = seasonsQuery.data?.[0] ?? null;

  const weatherScoreQuery = useQuery({
    queryKey: ["weather-score", teamId, latestSeason],
    queryFn: () => getTeamWeatherScore(teamId, latestSeason),
    enabled: !seasonsQuery.isPending,
  });

  const isPending =
    matchesQuery.isPending || teamQuery.isPending || seasonsQuery.isPending;
  const isError =
    matchesQuery.isError || teamQuery.isError || seasonsQuery.isError;

  const filteredMatches = useMemo(
    () => matches.filter((match) => matchesBands(match, filters)),
    [matches, filters],
  );

  const filteredStats = useMemo(
    () => computeTeamStats(filteredMatches, teamId),
    [filteredMatches, teamId],
  );

  const baselineStats = useMemo(
    () => computeTeamStats(matches, teamId),
    [matches, teamId],
  );

  const { visibleItems, hiddenCount, showMore, reset } =
    useVisibleItems(filteredMatches);

  useEffect(() => reset(), [filters, reset]);

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
        <CardContent className="py-10 text-center text-muted-foreground">
          Nie znaleziono drużyny o danym id.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TeamInfoCard matches={matches} team={team} />
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ChartColumn className="h-5 w-5 text-primary" />
              Statystyki drużyny
            </h2>
            <p className="text-sm text-muted-foreground">
              Statystyki drużyny - weather score z sezonu
              {latestSeason ? ` ${latestSeason}` : ""} i średnie statystyki po
              filtrach pogodowych.
            </p>
          </div>
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            {hasBandFilters(filters)
              ? `Po filtrach: ${filteredMatches.length} z ${matches.length} meczów`
              : `Wszystkie mecze (${matches.length})`}
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <WeatherScoreCard
            weatherScore={weatherScoreQuery.data}
            season={latestSeason}
            isPending={weatherScoreQuery.isPending}
            isError={weatherScoreQuery.isError}
          />
          <div className="xl:col-span-2">
            <TeamStatsCards
              stats={filteredStats}
              baseline={hasBandFilters(filters) ? baselineStats : null}
            />
          </div>
        </div>
      </section>

      <WeatherComparisonChart
        matches={matches}
        teamId={teamId}
        title="Wpływ warunków pogodowych"
        description="Wszystkie sezony — statystyki drużyny względem jej meczów w sprzyjających warunkach pogodowych."
      />

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Mecze drużyny
          </CardTitle>
          <CardDescription>
            Pokazano {filteredMatches.length} z {matches.length} meczów
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <MatchesTable matches={visibleItems} />
        </CardContent>
        <ShowMoreFooter hiddenCount={hiddenCount} onClick={showMore} />
      </Card>
      <ExportReportButton fileName={`Raport - ${team?.name ?? "drużyna"}`} />
    </>
  );
};

export default TeamDetails;
