import { useState } from "react";
import type {
  TeamWeatherScores,
  WeatherCategoryKey,
  WeatherFactor,
  WeatherFactorDefinitions,
} from "@/data/types";
import {
  WEATHER_FACTORS,
  WEATHER_FACTOR_LABELS,
  formatCategoryRange,
  getCategoryScore,
  weatherScoreLabel,
} from "@/lib/weatherScore";
import { weatherFactorIcons, weatherScoreColor } from "@/lib/weatherStylesConfig";
import { getLongDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherScoreCardProps {
  scores: TeamWeatherScores | undefined;
  categories: WeatherFactorDefinitions | undefined;
  isPending: boolean;
  isError: boolean;
}

const WeatherScoreCard = ({
  scores,
  categories,
  isPending,
  isError,
}: WeatherScoreCardProps) => {
  const [factor, setFactor] = useState<WeatherFactor>("precipitation");

  const status = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać weather score."
      : !scores || !categories
        ? "Weather score tej drużyny nie został jeszcze przeliczony."
        : null;

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <h1 className="text-center text-md tracking-wider font-bold">
            WEATHER SCORE
          </h1>
        </CardTitle>
        <CardDescription>
          Wszystkie sezony, 50 = gra jak zwykle
        </CardDescription>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEATHER_FACTORS.map((f) => {
            const Icon = weatherFactorIcons[f];
            const active = f === factor;
            return (
              <Button
                key={f}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={active}
                onClick={() => setFactor(f)}
              >
                <Icon />
                {WEATHER_FACTOR_LABELS[f]}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {status || !scores || !categories ? (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
            {status}
          </p>
        ) : (
          <>
            <ul className="flex flex-1 flex-col justify-around gap-6">
              {categories[factor].categories.map((category) => {
                const value = getCategoryScore(scores, {
                  factor,
                  category: category.name,
                } as WeatherCategoryKey);
                const color = value
                  ? weatherScoreColor(value.score)
                  : "text-muted-foreground";

                return (
                  <li key={category.name} className="flex flex-col gap-2">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium first-letter:uppercase">
                          {category.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCategoryRange(category, categories[factor].unit)}
                        </p>
                      </div>
                      <span
                        className={`text-3xl leading-none font-bold tabular-nums ${color}`}
                      >
                        {value?.score ?? "—"}
                      </span>
                    </div>

                    <div className={`relative h-2.5 rounded-full bg-current/15 ${color}`}>
                      <div
                        className="h-full rounded-full bg-current transition-[width] duration-500"
                        style={{ width: `${value?.score ?? 0}%` }}
                      />
                      <div className="absolute -top-1 left-1/2 h-4.5 w-0.5 -translate-x-1/2 rounded-full bg-foreground/50" />
                    </div>

                    <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                      <span>{value ? weatherScoreLabel(value.score) : "Brak danych"}</span>
                      <span className="shrink-0 tabular-nums">
                        meczów: {value?.matches_count ?? 0}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-0.5 rounded-full bg-foreground/50" />
                50 = jak zwykle
              </span>
              <span>Przeliczono {getLongDate(scores.computed_at)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherScoreCard;
