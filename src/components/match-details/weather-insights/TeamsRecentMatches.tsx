import { useMemo } from "react";
import { History } from "lucide-react";

import { type MatchWithWeather } from "@/services/matchesService";

import TeamMatchesCard from "./TeamMatchesCard";

const MAX_MATCHES_LENGTH = 5;

const beforeThisMatch = (list: MatchWithWeather[], match: MatchWithWeather) =>
  list
    .filter((m) => m.id !== match.id && m.datetime < match.datetime)
    .slice(0, MAX_MATCHES_LENGTH);

interface TeamsRecentMatchesProps {
  match: MatchWithWeather;
  homeMatches: MatchWithWeather[];
  awayMatches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const TeamsRecentMatches = ({
  match,
  homeMatches,
  awayMatches,
  isPending,
  isError,
}: TeamsRecentMatchesProps) => {
  const home_id = match.home_team_id;
  const away_id = match.away_team_id;

  const recentHomeMatches = useMemo(
    () => beforeThisMatch(homeMatches, match),
    [homeMatches, match],
  );

  const recentAwayMatches = useMemo(
    () => beforeThisMatch(awayMatches, match),
    [awayMatches, match],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">
          Ostatnie mecze obu drużyn
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TeamMatchesCard
          teamId={home_id}
          teamName={match.homeTeam.name}
          matches={recentHomeMatches}
          maxMatchesLength={MAX_MATCHES_LENGTH}
          isPending={isPending}
          isError={isError}
        />
        <TeamMatchesCard
          teamId={away_id}
          teamName={match.awayTeam.name}
          matches={recentAwayMatches}
          maxMatchesLength={MAX_MATCHES_LENGTH}
          isPending={isPending}
          isError={isError}
        />
      </div>
    </section>
  );
};

export default TeamsRecentMatches;
