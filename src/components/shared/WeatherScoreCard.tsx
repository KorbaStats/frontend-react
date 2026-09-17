import { useState, useEffect } from "react";
import { type WeatherScore, weatherScoreLabel } from "@/lib/weatherScore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeamWeatherScore } from "@/services/weatherStatsService";

interface WeatherScoreCardProps {
  teamId: number;
}

const RADIUS = 40;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score: number): string {
  if (score >= 55) return "text-green-600 dark:text-green-500/90";
  if (score >= 45) return "text-muted-foreground";
  return "text-destructive";
}

const WeatherScoreCard = ({ teamId }: WeatherScoreCardProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherScore, setWeatherScore] = useState<WeatherScore | null>(null);

  useEffect(() => {
    getTeamWeatherScore(teamId)
      .then(setWeatherScore)
      .catch((err) => {
        setError("Nie udało się pobrać weather score.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);

  const header = (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <h1 className="text-center text-md tracking-wider font-bold">
          WEATHER SCORE
        </h1>
      </CardTitle>
    </CardHeader>
  );

  if (isLoading || error || weatherScore === null) {
    const message = isLoading
      ? "Ładowanie..."
      : (error ??
        "Za mało meczów w trudnej lub normalnej pogodzie, żeby policzyć wskaźnik.");

    return (
      <Card>
        {header}
        <CardContent className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
          {message}
        </CardContent>
      </Card>
    );
  }

  const {
    score,
    difference,
    difficultAvg,
    normalAvg,
    difficultMatches,
    normalMatches,
  } = weatherScore;
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <Card>
      {header}
      <CardContent className="flex flex-1 flex-col items-center justify-between gap-6">
        <div className="flex flex-col items-center gap-4">
          {/* pierścień z wynikiem */}
          <div className="relative size-40 xl:size-48">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              {/* tło — pełny szary okrąg */}
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                className="stroke-muted"
              />
              {/* wypełnienie */}
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                className={`stroke-current ${color} transition-[stroke-dashoffset] duration-500`}
              />
            </svg>

            {/* liczba na środku */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums xl:text-5xl">
                {score}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          <p className={`text-center text-sm font-medium ${color}`}>
            {weatherScoreLabel(score)}
          </p>
        </div>

        {/* skąd wynik */}
        <dl className="flex w-full max-w-sm flex-col gap-3 border-t pt-4 text-sm xl:gap-4 xl:pt-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <dt className="font-medium">Trudne warunki</dt>
              <dd className="text-xs text-muted-foreground">
                na podstawie {difficultMatches} meczów
              </dd>
            </div>
            <dd className="text-right">
              <span className="font-semibold tabular-nums">
                {difficultAvg.toFixed(2)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                pkt/mecz
              </span>
            </dd>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <dt className="font-medium">Normalne warunki</dt>
              <dd className="text-xs text-muted-foreground">
                na podstawie {normalMatches} meczów
              </dd>
            </div>
            <dd className="text-right">
              <span className="font-semibold tabular-nums">
                {normalAvg.toFixed(2)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                pkt/mecz
              </span>
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <dt className="text-muted-foreground">Różnica</dt>
            <dd className={`font-semibold tabular-nums ${color}`}>
              {difference > 0 ? "+" : ""}
              {difference.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                pkt/mecz
              </span>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default WeatherScoreCard;
