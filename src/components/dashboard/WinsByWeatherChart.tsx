import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { Trophy } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { isDifficultWeather } from "@/lib/weatherProfile";
import { computeOutcomeSplit, type OutcomeSplit } from "@/lib/matchOutcomes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WinsByWeatherChartProps {
  matches: MatchWithWeather[];
  season: string | null;
}

const outcomes: { name: string; short: string; key: "home" | "draw" | "away" }[] = [
  { name: "Wygrane gospodarzy", short: "Gospodarze", key: "home" },
  { name: "Wygrane gości", short: "Goście", key: "away" },
  { name: "Remisy", short: "Remisy", key: "draw" },
];

const series = [
  { key: "normal", name: "Normalne", fill: "var(--weather-normal)" },
  { key: "difficult", name: "Trudne", fill: "var(--weather-difficult)" },
] as const;

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const toPcts = (split: OutcomeSplit) => ({
  home: pct(split.homeWins, split.matches),
  draw: pct(split.draws, split.matches),
  away: pct(split.awayWins, split.matches),
});

const WinsByWeatherChart = ({ matches, season }: WinsByWeatherChartProps) => {
  const normal = computeOutcomeSplit(
    matches.filter((m) => m.weather && !isDifficultWeather(m.weather)),
  );
  const difficult = computeOutcomeSplit(
    matches.filter((m) => m.weather && isDifficultWeather(m.weather)),
  );

  const normalPcts = toPcts(normal);
  const difficultPcts = toPcts(difficult);

  const data = outcomes.map((outcome) => ({
    name: outcome.short,
    normal: normalPcts[outcome.key],
    difficult: difficultPcts[outcome.key],
  }));

  const homeDiff = difficultPcts.home - normalPcts.home;

  return (
    <Card className="@container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy size={18} strokeWidth={2} className="text-primary" />
          Wygrane gospodarzy a pogoda
        </CardTitle>
        <CardDescription className="text-xs">
          <span className="font-bold">
            Wszystkie ligi{season ? `, sezon ${season}` : ""}
          </span>{" "}
          <br />
          Trudne warunki to: mróz, upał, silny deszcz, śnieg lub silny wiatr.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 @2xl:grid-cols-2 @2xl:gap-8">
        <div className="flex flex-col gap-4">
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data}
                barGap={2}
                barCategoryGap="25%"
                margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis domain={[0, "dataMax"]} hide />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                  }}
                  labelStyle={{ color: "var(--popover-foreground)" }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                />
                {series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.fill}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey={s.key}
                      position="top"
                      formatter={(value) => `${value}%`}
                      fill="var(--muted-foreground)"
                      fontSize={11}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {homeDiff === 0 ? (
              "Pogoda nie zmienia odsetka wygranych gospodarzy."
            ) : (
              <>
                W trudnych warunkach gospodarze wygrywają{" "}
                <span className="font-semibold text-foreground">
                  o {Math.abs(homeDiff)} p.p.{" "}
                  {homeDiff > 0 ? "częściej" : "rzadziej"}
                </span>
                .
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="pb-1 text-right font-normal text-foreground">
                  Warunki pogodowe:{" "}
                </th>
                {series.map((s) => (
                  <th key={s.key} className="pb-1 text-right font-normal">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ background: s.fill }}
                      />
                      {s.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome) => (
                <tr key={outcome.key}>
                  <td className="py-1 text-muted-foreground">{outcome.name}</td>
                  <td className="py-1 text-right font-medium tabular-nums">
                    {normalPcts[outcome.key]}%
                  </td>
                  <td className="py-1 text-right font-medium tabular-nums">
                    {difficultPcts[outcome.key]}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-muted-foreground">
            {normal.matches} meczów w normalnych warunkach, {difficult.matches}{" "}
            w trudnych
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinsByWeatherChart;
