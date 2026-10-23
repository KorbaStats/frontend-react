import { type WeatherScore, weatherScoreLabel } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherStylesConfig";
import WeatherScoreRing from "@/components/shared/weather-score/WeatherScoreRing";

interface WeatherScoreIndicatorProps {
  teamName: string;
  weatherScore: WeatherScore | null;
  isPending: boolean;
  isError: boolean;
}

const WeatherScoreIndicator = ({
  teamName,
  weatherScore,
  isPending,
  isError,
}: WeatherScoreIndicatorProps) => {
  if (isPending || isError || !weatherScore) {
    const message = isPending
      ? "Ładowanie..."
      : isError
        ? "Nie udało się pobrać weather score."
        : "Za mało meczów do oceny";

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
