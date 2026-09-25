import { CloudSun } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { Card, CardContent } from "@/components/ui/card";
import WeatherScoreIndicator from "@/components/shared/weather-score/WeatherScoreIndicator";

interface TeamsWeatherScoreSectionProps {
  match: MatchWithWeather;
}

const TeamsWeatherScoreSection = ({ match }: TeamsWeatherScoreSectionProps) => {
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
            teamId={match.home_team_id}
            teamName={match.homeTeam.name}
            season={match.season}
          />
          <div className="h-24 w-px bg-border" />
          <WeatherScoreIndicator
            teamId={match.away_team_id}
            teamName={match.awayTeam.name}
            season={match.season}
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default TeamsWeatherScoreSection;
