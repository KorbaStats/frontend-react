import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { History } from "lucide-react";

import type { Team, WeatherCondition } from "@/data/types";

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
import WeatherFiltersCard, {
  type WeatherFilterValue,
} from "@/components/team-details/WeatherFiltersCard";
import TeamStatsCards from "@/components/team-details/TeamStatsCards";

import { computeTeamStats } from "@/lib/teamStats";
import { getConditions } from "@/lib/matchFilters";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter"

const DEFAULT_CONDITION: WeatherCondition = "clear";

const TeamDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const { id } = useParams();
  const teamId = Number(id);
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [team, setTeam] = useState<Team>();

  // stany filtrów pogodowych
  const [condition, setCondition] = useState<WeatherFilterValue>(DEFAULT_CONDITION);

  // warunki dostępne dla drużyny (wszystkie, przy których grała)
  const availableConditions = useMemo(() => getConditions(matches), [matches]);

  // mecze odfiltrowane po wybranym warunku
  const filteredMatches = useMemo(
    () =>
      condition === "all"
        ? matches
        : matches.filter((m) => m.weather?.condition === condition),
    [matches, condition],
  );

  // dane wyliczone dla TeamStatsCards: filteredStats (po pogodzie) i wszystkie mecze (nieodfiltrowane, jako punkt odniesienia)
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

  const handleConditionChange = (next: WeatherFilterValue) => {
    setCondition(next);
    reset();
  }

  // pobieranie danych po teamId
  useEffect(() => {
    Promise.all([getTeamMatches(teamId), getTeamById(teamId)])
      .then(([matches, team]) => {
        setMatches(matches);
        reset(); //reset pagination each re-render (switching teams)
        const available = getConditions(matches); //reset for active condition filter
        setCondition(
          available.includes(DEFAULT_CONDITION) ? DEFAULT_CONDITION : "all", //reset to default condition; all for backup if team doesnt played in default condition
        );
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
      {/* Filtry pogodowe */}
      <WeatherFiltersCard
        value={condition}
        onChange={handleConditionChange}
        available={availableConditions}
        shownCount={filteredMatches.length}
        totalCount={matches.length}
      />
      {/* Statystyki */}
      <TeamStatsCards stats={filteredStats} baseline={baselineStats} />
      {/* Karta z tabelą meczów */}
      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Mecze drużyny
          </CardTitle>
          <CardDescription>
            Mecze z panującymi warunkami pogodowymi
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
