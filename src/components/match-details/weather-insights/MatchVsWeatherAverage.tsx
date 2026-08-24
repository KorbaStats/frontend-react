import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Scale } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  getMatchAveragesByCondition,
  type ConditionAverages,
} from "@/services/weatherStatsService";

import {
  getCombinedMatchStats,
  type CombinedStatKey,
} from "@/lib/combinedMatchStats";
import { weatherConfig } from "@/lib/weatherConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MatchVsWeatherAverageProps {
  match: MatchWithWeather;
}

type ChartRow = {
  label: string;
  match: number;
  average: number;
  decimals: number;
};

// tylko statystyki o zblizonej skali
const chartedStats: { key: CombinedStatKey; label: string; decimals: number }[] =
  [
    { key: "goals", label: "Gole", decimals: 1 },
    { key: "xg", label: "xG", decimals: 2 },
    { key: "shots_on_target", label: "Strzały celne", decimals: 1 },
    { key: "corner_kicks", label: "Rożne", decimals: 1 },
    { key: "yellow_cards", label: "Żółte kartki", decimals: 1 },
    { key: "fouls", label: "Faule", decimals: 1 },
    { key: "goalkeeper_saves", label: "Obrony", decimals: 1 },
  ];

const percentageStats: { key: CombinedStatKey; label: string }[] = [
  { key: "pass_accuracy_pct", label: "Celność podań" },
];

const PercentageTile = ({
  label,
  matchValue,
  averageValue,
}: {
  label: string;
  matchValue: number | null;
  averageValue: number | null;
}) => {
  const delta =
    matchValue !== null && averageValue !== null
      ? matchValue - averageValue
      : null;

  const deltaClass =
    delta === null || delta === 0
      ? "text-muted-foreground"
      : delta > 0
        ? "text-green-600 dark:text-green-500/90"
        : "text-destructive";

  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-foreground">
        {matchValue === null ? "—" : `${matchValue.toFixed(1)}%`}
      </p>
      <p className="text-xs tabular-nums">
        {delta === null ? (
          <span className="text-muted-foreground">Brak danych do porównania</span>
        ) : (
          <>
            <span className={`font-medium ${deltaClass}`}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} pp
            </span>
            <span className="text-muted-foreground">
              {" "}
              vs {averageValue!.toFixed(1)}% średnio
            </span>
          </>
        )}
      </p>
    </div>
  );
};

const MatchVsWeatherAverage = ({ match }: MatchVsWeatherAverageProps) => {
  const condition = match.weather?.condition ?? null;

  const [conditionAverages, setConditionAverages] = useState<ConditionAverages | null>(null);
  const [isLoading, setIsLoading] = useState(condition !== null);
  const [error, setError] = useState<string | null>(null);

  const conditionLabel = condition
    ? weatherConfig[condition].label.toLowerCase()
    : null;

  const matchStats = getCombinedMatchStats(match);

  // null (mecz bez ligi) znaczy dla serwisu "nie filtruj", stąd konwersja.
  const leagueId = match.league_id ?? undefined;

  useEffect(() => {
    if (condition === null) return;

    // Zawężone do ligi tego meczu — ligi różnią się liczbą goli i kartek, więc
    // średnia z czterech lig naraz mierzyłaby po części skład ligowy, a nie pogodę.
    getMatchAveragesByCondition(condition, leagueId)
      .then((data) => {
        setConditionAverages(data);
        setError(null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać średnich dla tej pogody.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [condition, leagueId]);

  const averages = conditionAverages?.averages ?? null;

  // Statystyki, które mają wartość i w tym meczu, i w średniej.
  const chartData: ChartRow[] = averages
    ? chartedStats.flatMap((stat) => {
        const matchValue = matchStats[stat.key];
        const averageValue = averages[stat.key];

        if (matchValue === null || averageValue === null) return [];

        return [
          {
            label: stat.label,
            match: Number(matchValue.toFixed(stat.decimals)),
            average: Number(averageValue.toFixed(stat.decimals)),
            decimals: stat.decimals,
          },
        ];
      })
    : [];

  const placeholder = isLoading
    ? "Ładowanie..."
    : error
      ? error
      : condition === null
        ? "Brak danych pogodowych dla tego meczu."
        : chartData.length === 0
          ? "Brak statystyk do porównania."
          : null;

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4 text-primary" />
          Ten mecz vs przeciętny mecz przy tej pogodzie
        </CardTitle>
        <CardDescription>
          {conditionLabel && conditionAverages
            ? `Statystyki obu drużyn razem, zestawione ze średnią z ${conditionAverages.matchCount} meczów${match.league ? ` ${match.league.name}` : ""} rozegranych przy takich warunkach (${conditionLabel}).`
            : "Statystyki obu drużyn razem, zestawione ze średnią meczów przy takich samych warunkach."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {placeholder ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar
                  dataKey="match"
                  name="Ten mecz"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="average"
                  name={`Średnia (${conditionLabel})`}
                  fill="var(--muted-foreground)"
                  fillOpacity={0.4}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
                    
            <div className="grid grid-cols-2 gap-2">
              {percentageStats.map((stat) => (
                <PercentageTile
                  key={stat.key}
                  label={stat.label}
                  matchValue={matchStats[stat.key]}
                  averageValue={averages?.[stat.key] ?? null}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchVsWeatherAverage;
