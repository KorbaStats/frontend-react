import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { History } from "lucide-react";

import type { Team } from "@/data/types";

import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import { getTeamById } from "@/services/teamsService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MatchesTable from "@/components/shared/MatchesTable";
import TeamInfoCard from "@/components/team-details/TeamInfoCard";
import TeamStatsCards from "@/components/team-details/TeamStatsCards";

import { computeTeamStats } from "@/lib/teamStats";
import { hasBandFilters, matchesBands } from "@/lib/matchFilters";
import { useLayoutFilters } from "@/hooks/useLayoutFilters";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter"

const TeamDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const { id } = useParams();
  const teamId = Number(id);
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [team, setTeam] = useState<Team>();

  const { filters } = useLayoutFilters();

  const filteredMatches = useMemo(
    () => matches.filter((match) => matchesBands(match, filters)),
    [matches, filters],
  );

  // dane dla TeamStatsCards: po filtrze pogodowym i wszystkie mecze jako baza
  const filteredStats = useMemo(
    () => computeTeamStats(filteredMatches, teamId),
    [filteredMatches, teamId],
  );

  const baselineStats = useMemo(
    () => computeTeamStats(matches, teamId),
    [matches, teamId],
  );

  // własny hook do paginacji
  const { visibleItems, hiddenCount, showMore, reset } =
    useVisibleItems(filteredMatches);

  useEffect(() => reset(), [filters, reset]);

  // pobieranie danych po teamId
  useEffect(() => {
    Promise.all([getTeamMatches(teamId), getTeamById(teamId)])
      .then(([matches, team]) => {
        setMatches(matches);
        reset(); // reset paginacji przy przełączeniu drużyny
        setTeam(team);
      })
      .catch((err) => {
        setError(`Nie znaleziono drużyny o danym id.`);
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId, reset]);

  // obsługa stanów ładowania i błędu
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
      {/* Statystyki */}
      <TeamStatsCards
        stats={filteredStats}
        baseline={hasBandFilters(filters) ? baselineStats : null}
      />
      {/* Karta z tabelą meczów */}
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
    </>
  );
};

export default TeamDetails;
