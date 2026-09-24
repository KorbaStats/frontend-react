import { useEffect, useState } from "react";

import { type WeatherScore, weatherScoreLabel } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherConfig";
import { getTeamWeatherScore } from "@/services/weatherStatsService";
import WeatherScoreRing from "@/components/shared/weather-score/WeatherScoreRing";

interface WeatherScoreIndicatorProps {
  teamId: number;
  teamName: string;
  /** null = ze wszystkich sezonów */
  season?: string | null;
}

const WeatherScoreIndicator = ({
  teamId,
  teamName,
  season = null,
}: WeatherScoreIndicatorProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherScore, setWeatherScore] = useState<WeatherScore | null>(null);

  useEffect(() => {
    getTeamWeatherScore(teamId, season)
      .then(setWeatherScore)
      .catch((err) => {
        setError("Nie udało się pobrać weather score.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId, season]);

  if (isLoading || error || weatherScore === null) {
    const message = isLoading
      ? "Ładowanie..."
      : (error ?? "Za mało meczów do oceny");

    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-semibold">{teamName}</p>
        <div className="flex size-32 items-center justify-center text-sm text-muted-foreground">
          {message}
        </div>
      </div>
    );
  }

  const { score, difference } = weatherScore;
  const color = weatherScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-semibold">{teamName}</p>

      <WeatherScoreRing score={score} />
      <div className="flex flex-col gap-1">
        <p
          className={`text-xs font-semibold tracking-wider uppercase ${color}`}
        >
          {weatherScoreLabel(score)}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className={`font-semibold tabular-nums ${color}`}>
            {difference > 0 ? "+" : ""}
            {difference.toFixed(2)}
          </span>{" "}
          pkt/mecz w trudnej pogodzie
        </p>
      </div>
    </div>
  );
};

export default WeatherScoreIndicator;
