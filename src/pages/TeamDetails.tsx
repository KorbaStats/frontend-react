import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { ChartColumn, History } from "lucide-react";

import type { Team } from "@/data/types";
import type { FiltersContext } from "@/components/layout/MainLayout";

import {
  getAvailableSeasons,
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import { getTeamById } from "@/services/teamsService";

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
import ExportReportButton from "@/components/shared/ExportReportButton";

const TeamDetails = () => {
  const { id } = useParams();
  const teamId = Number(id);
  const { filters } = useOutletContext<FiltersContext>();

  const [team, setTeam] = useState<Team>();
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [latestSeason, setLatestSeason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

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

  useEffect(() => {
    Promise.all([
      getTeamMatches(teamId),
      getTeamById(teamId),
      getAvailableSeasons(),
    ])
      .then(([matches, team, seasons]) => {
        setMatches(matches);
        setTeam(team);
        setLatestSeason(seasons[0] ?? null);
        reset();
      })
      .catch((err) => {
        setError("Nie znaleziono drużyny o danym id.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId, reset]);

  useEffect(() => reset(), [filters, reset]);

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TeamInfoCard matches={matches} team={team} />
      {/* Team stats Section */}
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
          <WeatherScoreCard teamId={teamId} season={latestSeason} />
          <div className="xl:col-span-2">
            <TeamStatsCards
              stats={filteredStats}
              baseline={hasBandFilters(filters) ? baselineStats : null}
            />
          </div>
        </div>
      </section>

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
