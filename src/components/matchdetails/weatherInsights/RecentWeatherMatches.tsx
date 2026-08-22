import { useEffect, useState } from "react";

import {
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import { weatherConfig } from "@/lib/weatherConfig";

import TeamMatchesCard from "./TeamMatchesCard";

const MAX_MATCHES_LENGTH = 3;

interface RecentWeatherMatchesProps {
  match: MatchWithWeather;
}

const RecentWeatherMatches = ({ match }: RecentWeatherMatchesProps) => {
  const home_id = match.home_team_id;
  const away_id = match.away_team_id;

  const [homeMatches, setHomeMatches] = useState<MatchWithWeather[]>([]);
  const [awayMatches, setAwayMatches] = useState<MatchWithWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const condition = match.weather?.condition ?? null;
  const config = condition ? weatherConfig[condition] : null;

  useEffect(() => {
    // tylko mecze w tej samej pogodzie, inny niz oglądany, wczesniejsze
    const inSameWeather = (list: MatchWithWeather[]) =>
      list
        .filter(
          (m) =>
            m.id !== match.id &&
            m.weather?.condition === condition &&
            m.datetime < match.datetime,
        )
        .slice(0, MAX_MATCHES_LENGTH);

    Promise.all([getTeamMatches(home_id), getTeamMatches(away_id)])
      .then(([home, away]) => {
        setHomeMatches(inSameWeather(home));
        setAwayMatches(inSameWeather(away));
        setError(null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać wcześniejszych meczów.");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [match, condition, home_id, away_id]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {config && <config.icon size={16} className="text-primary" />}
        <h3 className="font-semibold text-foreground">
          Ostatnie mecze w tej pogodzie
        </h3>
        {config && (
          <span className="text-sm text-muted-foreground">
            ({config.label.toLowerCase()})
          </span>
        )}
      </div>

      {/* Poniżej 1120px tabele nie mieszczą się obok siebie bez scrolla */}
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

export default RecentWeatherMatches;
