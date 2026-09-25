import { useState, useEffect } from "react";
import { type WeatherScore, weatherScoreLabel } from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTeamWeatherScore } from "@/services/weatherStatsService";
import WeatherScoreRing from "@/components/shared/weather-score/WeatherScoreRing";

interface WeatherScoreCardProps {
  teamId: number;
  /** null = ze wszystkich sezonów */
  season?: string | null;
}

const WeatherScoreCard = ({ teamId, season = null }: WeatherScoreCardProps) => {
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

  const header = (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <h1 className="text-center text-md tracking-wider font-bold">
          WEATHER SCORE
        </h1>
      </CardTitle>
      <CardDescription>
        {season ? `Sezon ${season}` : "Wszystkie sezony"}
      </CardDescription>
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
  const color = weatherScoreColor(score);

  return (
    <Card className="break-inside-avoid">
      {header}
      <CardContent className="flex flex-1 flex-col items-center justify-between gap-6 lg:flex-row lg:justify-center lg:gap-12 xl:flex-col xl:justify-between xl:gap-6">
        <div className="flex flex-col items-center gap-4">
          <WeatherScoreRing score={score} size="lg" />

          <p className={`text-center text-sm font-medium ${color}`}>
            {weatherScoreLabel(score)}
          </p>
        </div>

        <dl className="flex w-full max-w-sm flex-col gap-3 pt-4 text-sm lg:border-l lg:pt-0 lg:pl-12 xl:gap-4 xl:border-l-0 xl:pt-6 xl:pl-0">
          <div className="flex items-start justify-between gap-2">
            {/* Trudne warunki */}
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
            {/* Normalne warunki */}
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

          {/* Różnica */}
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
