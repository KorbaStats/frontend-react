import { useState, useEffect } from "react";
import { useParams } from "react-router";

import type { Team } from "@/data/types";
import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchStatsService";
import { getTeamById } from "@/services/teamsService";
import TeamInfoCard from "@/components/teampage/TeamInfoCard";

const TeamPage = () => {
  const { id } = useParams();
  const teamId = Number(id);

  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [team, setTeam] = useState<Team>();

  useEffect(() => {
    Promise.all([getTeamMatches(teamId), getTeamById(teamId)]).then(
      ([matches, team]) => {
        setMatches(matches);
        setTeam(team);
      },
    );
  }, [teamId]);

  return (
    <>
      <TeamInfoCard matches={matches} team={team} />
    </>
  );
};

export default TeamPage;
