import { useMemo } from "react";
import { CloudSun } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { Card, CardContent } from "@/components/ui/card";
import { computeTeamWeatherScore } from "@/lib/weatherScore";
import WeatherScoreIndicator from "@/components/shared/weather-score/WeatherScoreIndicator";

interface TeamsWeatherScoreSectionProps {
  match: MatchWithWeather;
  homeMatches: MatchWithWeather[];
  awayMatches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const TeamsWeatherScoreSection = ({
  match,
  homeMatches,
  awayMatches,
  isPending,
  isError,
}: TeamsWeatherScoreSectionProps) => {
  const homeScore = useMemo(
    () => computeTeamWeatherScore(homeMatches, match.home_team_id, match.season),
    [homeMatches, match.home_team_id, match.season],
  );
  const awayScore = useMemo(
    () => computeTeamWeatherScore(awayMatches, match.away_team_id, match.season),
    [awayMatches, match.away_team_id, match.season],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CloudSun size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Weather Score drużyn</h3>
        <span className="text-sm text-muted-foreground">
          (trudna pogoda na tle normalnej
          {match.season ? `, sezon ${match.season}` : ""})
        </span>
      </div>

      <Card className="break-inside-avoid">
        <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <WeatherScoreIndicator
            teamName={match.homeTeam.name}
            weatherScore={homeScore}
            isPending={isPending}
            isError={isError}
          />
          <div className="h-24 w-px bg-border" />
          <WeatherScoreIndicator
            teamName={match.awayTeam.name}
            weatherScore={awayScore}
            isPending={isPending}
            isError={isError}
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default TeamsWeatherScoreSection;
