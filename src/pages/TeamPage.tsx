import { useState, useEffect } from "react";
import { useParams } from "react-router";

import type { Team } from "@/data/types";
import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchStatsService";
import { getTeamById } from "@/services/teamsService";
import TeamInfoCard from "@/components/teampage/TeamInfoCard";

import { Card, CardContent } from "@/components/ui/card";

const TeamPage = () => {
  const { id } = useParams();
  const teamId = Number(id);

  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [team, setTeam] = useState<Team>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    Promise.all([getTeamMatches(teamId), getTeamById(teamId)])
      .then(([matches, team]) => {
        setMatches(matches);
        setTeam(team);
      })
      .catch((err) => {
        setError("Pobieranie danych nie powiodło się");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);

  console.log(team);

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
        <CardContent className="py-10 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TeamInfoCard matches={matches} team={team} />
    </>
  );
};

export default TeamPage;
