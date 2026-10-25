import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router";
import { ChartColumn, History } from "lucide-react";

import type { FiltersOutletContext } from "@/components/layout/MainLayout";

import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";

import { computeTeamStats } from "@/lib/teamStats";
import { computeWeatherScore } from "@/lib/weatherScore";
import { hasBandFilters, matchesBands } from "@/lib/matchFilters";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import { teamsOptions } from "@/hooks/queries";

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
    ...teamsOptions,
    select: (teams) => teams.find((t) => t.id === teamId),
  });

  const matches = matchesQuery.data ?? EMPTY_MATCHES;
  const team = teamQuery.data;

  const weatherScore = useMemo(
    () => computeWeatherScore(matches, teamId),
    [matches, teamId],
  );

  const isPending = matchesQuery.isPending || teamQuery.isPending;
  const isError = matchesQuery.isError || teamQuery.isError || !team;

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
              Statystyki drużyny - weather score ze wszystkich sezonów i
              średnie statystyki po filtrach pogodowych.
            </p>
          </div>
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            {hasBandFilters(filters)
              ? `Po filtrach: ${filteredMatches.length} z ${matches.length} meczów`
              : `Wszystkie mecze (${matches.length})`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 print:grid-cols-1">
          <div className="row-span-2 grid">
            <WeatherScoreCard weatherScore={weatherScore} />
          </div>
          <div className="col-span-2 print:col-span-1">
            <TeamStatsCards
              stats={filteredStats}
              baseline={hasBandFilters(filters) ? baselineStats : null}
            />
          </div>
          <div className="col-span-2 print:col-span-1">
            <WeatherComparisonChart
              matches={matches}
              teamId={teamId}
              title="Wpływ warunków pogodowych"
              description="Wszystkie sezony — statystyki drużyny względem jej meczów w sprzyjających warunkach pogodowych."
            />
          </div>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
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
