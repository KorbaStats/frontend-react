import { useEffect, useState } from "react";
import { History } from "lucide-react";

import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";

import TeamMatchesCard from "./TeamMatchesCard";

const MAX_MATCHES_LENGTH = 5;

interface TeamsRecentMatchesProps {
  match: MatchWithWeather;
}

const TeamsRecentMatches = ({ match }: TeamsRecentMatchesProps) => {
  const home_id = match.home_team_id;
  const away_id = match.away_team_id;

  const [homeMatches, setHomeMatches] = useState<MatchWithWeather[]>([]);
  const [awayMatches, setAwayMatches] = useState<MatchWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const beforeThisMatch = (list: MatchWithWeather[]) =>
      list
        .filter((m) => m.id !== match.id && m.datetime < match.datetime)
        .slice(0, MAX_MATCHES_LENGTH);

    Promise.all([getTeamMatches(home_id), getTeamMatches(away_id)])
      .then(([home, away]) => {
        setHomeMatches(beforeThisMatch(home));
        setAwayMatches(beforeThisMatch(away));
        setError(null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać wcześniejszych meczów.");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [match, home_id, away_id]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">
          Ostatnie mecze obu drużyn
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[1120px]:grid-cols-2">
        <TeamMatchesCard
          teamId={home_id}
          teamName={match.homeTeam.name}
          matches={homeMatches}
          maxMatchesLength={MAX_MATCHES_LENGTH}
          isLoading={isLoading}
          error={error}
        />
        <TeamMatchesCard
          teamId={away_id}
          teamName={match.awayTeam.name}
          matches={awayMatches}
          maxMatchesLength={MAX_MATCHES_LENGTH}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </section>
  );
};

export default TeamsRecentMatches;
