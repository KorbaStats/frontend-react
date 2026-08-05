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
import TeamInfoCard from "@/components/teampage/TeamInfoCard";
import WeatherFilterPills, {type WeatherFilterValue} from "@/components/teampage/WeatherFilterPills";


const TeamPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const { id } = useParams();
  const teamId = Number(id);
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [team, setTeam] = useState<Team>();

  // states for weather filters
  const [condition, setCondition] = useState<WeatherFilterValue>('all');

  // everything below the filters is derived from this narrowed list
  const filteredMatches = useMemo(
    () =>
      condition === "all"
        ? matches
        : matches.filter((m) => m.weather?.condition === condition),
    [matches, condition],
  );

  useEffect(() => {
    Promise.all([getTeamMatches(teamId), getTeamById(teamId)])
      .then(([matches, team]) => {
        setMatches(matches);
        setTeam(team);
      })
      .catch((err) => {
        setError(`Nie znaleziono drużyny o danym id.`);
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);


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
      <WeatherFilterPills value={condition} onChange={setCondition} />
      {/* Cardy statystyk */}
      <div className="grid gap-3 grid-cols-5">

      </div>
      {/* Matches table card */}
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
          <MatchesTable matches={filteredMatches} />
        </CardContent>
      </Card>
    </>
  );
};

export default TeamPage;
