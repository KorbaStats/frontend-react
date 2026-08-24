import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { PieChart } from "lucide-react";

import type { WeatherCondition } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";

import { getGoalsByWeatherCondition } from "@/services/weatherStatsService";
import { weatherConfig } from "@/lib/weatherConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GoalsByWeatherRadialProps {
  match: MatchWithWeather;
}

type ChartRow = {
  condition: WeatherCondition;
  label: string;
  avgGoals: number;
  matchCount: number;
  fill: string;
};

const GoalsByWeatherRadial = ({ match }: GoalsByWeatherRadialProps) => {
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const condition = match.weather?.condition ?? null;
  // null (mecz bez ligi) znaczy dla serwisu "nie filtruj", stąd konwersja.
  const leagueId = match.league_id ?? undefined;

  useEffect(() => {
    // Tylko liga tego meczu — inaczej "średnia goli przy śniegu" mierzyłaby
    // po części to, że śnieg pada w Ekstraklasie, a nie w LaLiga.
    getGoalsByWeatherCondition(leagueId)
      .then((stats) => {
        setChartData(
          stats
            .filter((s) => s.matchCount > 0)
            .map((s) => ({
              condition: s.condition,
              label: weatherConfig[s.condition].label,
              avgGoals: s.avgGoals,
              matchCount: s.matchCount,
              fill: weatherConfig[s.condition].chartColor,
            }))
            .sort((a, b) => b.avgGoals - a.avgGoals),
        );
        setError(null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać danych do wykresu.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  /*
  *  Skala łuków. Bez wspólnej górnej granicy recharts rysowałby każdy łuk na
  *  pełny okrąg i wszystkie wyglądałyby identycznie. Zapas 20% nad maksimum,
  * żeby najdłuższy łuk nie domykał się w pełne koło.
  */
  const maxGoals = Math.max(...chartData.map((row) => row.avgGoals), 0) * 1.2;

  const placeholder = isLoading
    ? "Ładowanie wykresu..."
    : error
      ? error
      : chartData.length === 0
        ? "Brak danych do wykresu."
        : null;

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-4 w-4 text-primary" />
          Średnia goli wg. warunków pogodowych
        </CardTitle>
        <CardDescription>
          Ile goli średnio padało przy różnych warunkach pogodowych
          {match.league ? ` w ${match.league.name}` : ""}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {placeholder ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart
                data={chartData}
                innerRadius="32%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                barSize={12}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, maxGoals]}
                  tick={false}
                />
                <RadialBar
                  dataKey="avgGoals"
                  background={{ fill: "var(--muted)" }}
                  cornerRadius={6}
                >
                  {chartData.map((row) => (
                    <Cell
                      key={row.condition}
                      fill={row.fill}
                      fillOpacity={
                        condition === null || row.condition === condition
                          ? 1
                          : 0.45
                      }
                    />
                  ))}
                </RadialBar>
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${value} gola/mecz (${(item.payload as ChartRow).matchCount} meczów)`,
                    (item.payload as ChartRow).label,
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <ul className="mt-2 space-y-1.5">
              {chartData.map((row) => {
                const isCurrent = row.condition === condition;

                return (
                  <li
                    key={row.condition}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.fill }}
                      />
                      <span
                        className={`truncate ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                      >
                        {row.label}
                      </span>
                      {/* Zaznaczenie warunku pogodowego z aktualnego meczu */}
                      {isCurrent && (
                        <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                          ten mecz
                        </span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 tabular-nums ${isCurrent ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}
                    >
                      {row.avgGoals.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsByWeatherRadial;
