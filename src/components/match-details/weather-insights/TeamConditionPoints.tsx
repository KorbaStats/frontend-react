import { useMemo } from "react";
import { ArrowDown, ArrowUp, Medal } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import type { WeatherFactorDefinitions } from "@/data/types";
import {
  computeConditionPoints,
  type TeamPoints,
} from "@/lib/teamConditionPoints";
import { formatNumber } from "@/lib/weatherFormat";
import { formatCategoryRange } from "@/lib/weatherScore";
import { weatherFactorIcons } from "@/lib/weatherStylesConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TeamConditionPointsProps {
  match: MatchWithWeather;
  homeMatches: MatchWithWeather[];
  awayMatches: MatchWithWeather[];
  categories: WeatherFactorDefinitions | undefined;
  isPending: boolean;
  isError: boolean;
}

const ROW_GRID = "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3";
const MEANINGFUL_DIFF = 0.1;

const matchesLabel = (count: number) => {
  if (count === 1) return "1 mecz";
  return count >= 2 && count <= 4 ? `${count} mecze` : `${count} meczów`;
};

const PointsCell = ({
  points,
  usual,
}: {
  points: TeamPoints;
  usual: number | null;
}) => {
  if (points.avgPoints === null) {
    return <span className="text-right text-sm text-muted-foreground">—</span>;
  }

  const diff = usual === null ? 0 : points.avgPoints - usual;

  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="inline-flex items-center gap-1 text-lg font-bold tabular-nums">
        {diff >= MEANINGFUL_DIFF && (
          <ArrowUp
            aria-label="więcej niż zwykle"
            className="h-3.5 w-3.5 text-green-600 dark:text-green-500/90"
          />
        )}
        {diff <= -MEANINGFUL_DIFF && (
          <ArrowDown
            aria-label="mniej niż zwykle"
            className="h-3.5 w-3.5 text-destructive"
          />
        )}
        {formatNumber(points.avgPoints, 2)}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {matchesLabel(points.matches)}
      </span>
    </div>
  );
};

const TeamConditionPoints = ({
  match,
  homeMatches,
  awayMatches,
  categories,
  isPending,
  isError,
}: TeamConditionPointsProps) => {
  const points = useMemo(
    () =>
      categories
        ? computeConditionPoints(categories, match, homeMatches, awayMatches)
        : null,
    [categories, match, homeMatches, awayMatches],
  );

  const placeholder = isPending
    ? "Ładowanie..."
    : isError || !categories
      ? "Nie udało się pobrać meczów drużyn."
      : !points
        ? "Brak danych pogodowych dla tego meczu."
        : null;

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Medal className="h-4 w-4 text-primary" />
          Punkty na mecz w takich warunkach
        </CardTitle>
        <CardDescription>
          Średnio ile punktów zdobywa drużyna w pogodzie jak w tym meczu.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {placeholder || !points || !categories ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <>
            <div className={`${ROW_GRID} text-xs font-medium`}>
              <span className="text-muted-foreground">Warunki meczu</span>
              <span className="truncate text-right">{match.homeTeam.name}</span>
              <span className="truncate text-right">{match.awayTeam.name}</span>
            </div>

            <div className="flex flex-col divide-y">
              {points.rows.map(({ factor, definition, home, away }) => {
                const Icon = weatherFactorIcons[factor];

                return (
                  <div key={factor} className={`${ROW_GRID} py-2`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex min-w-0 flex-col leading-tight">
                        <span className="text-sm font-medium first-letter:uppercase">
                          {definition.label}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatCategoryRange(definition, categories[factor].unit)}
                        </span>
                      </div>
                    </div>
                    <PointsCell points={home} usual={points.usualHome.avgPoints} />
                    <PointsCell points={away} usual={points.usualAway.avgPoints} />
                  </div>
                );
              })}
            </div>

            <div className={`${ROW_GRID} rounded-md bg-muted px-3 py-2`}>
              <span className="text-sm font-medium">Zwykle, wszystkie mecze</span>
              <PointsCell points={points.usualHome} usual={null} />
              <PointsCell points={points.usualAway} usual={null} />
            </div>

            <p className="mt-auto text-xs text-muted-foreground">
              Strzałka oznacza wynik lepszy lub gorszy niż zwykle. Weather Score bierze
              pod uwagę też kursy i xG, więc może pokazać inny kierunek niż same punkty.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamConditionPoints;
