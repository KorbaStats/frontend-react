import type { MatchWeatherScoreSide } from "@/data/types";
import { weatherScoreLabel } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherStylesConfig";
import WeatherScoreRing from "@/components/shared/weather-score/WeatherScoreRing";

interface WeatherScoreIndicatorProps {
  teamName: string;
  side: MatchWeatherScoreSide | undefined;
  message: string | null;
}

const WeatherScoreIndicator = ({
  teamName,
  side,
  message,
}: WeatherScoreIndicatorProps) => {
  if (message || !side || side.weather_score === null) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-semibold">{teamName}</p>
        <div className="flex size-32 items-center justify-center text-sm text-muted-foreground">
          {message ?? "Brak danych pogodowych meczu"}
        </div>
      </div>
    );
  }

  const score = Math.round(side.weather_score);
  const color = weatherScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-semibold">{teamName}</p>

      <WeatherScoreRing score={score} />
      <p className={`text-xs font-semibold tracking-wider uppercase ${color}`}>
        {weatherScoreLabel(score)}
      </p>
    </div>
  );
};

export default WeatherScoreIndicator;
