import { useMemo } from "react";
import { CloudSun } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeWeatherScore } from "@/lib/weatherScore";
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
    () => computeWeatherScore(homeMatches, match.home_team_id),
    [homeMatches, match.home_team_id],
  );
  const awayScore = useMemo(
    () => computeWeatherScore(awayMatches, match.away_team_id),
    [awayMatches, match.away_team_id],
  );

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudSun className="h-4 w-4 text-primary" />
          Weather Score drużyn
        </CardTitle>
        <CardDescription>
          Trudna pogoda na tle normalnej, wszystkie sezony.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-6">
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
  );
};

export default TeamsWeatherScoreSection;
