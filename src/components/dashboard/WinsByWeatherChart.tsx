import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Trophy } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { isDifficultWeather } from "@/lib/weatherScore";
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

const rows: { name: string; key: "home" | "draw" | "away"; fill: string }[] = [
  { name: "Wygrane gospodarzy", key: "home", fill: "var(--outcome-home)" },
  { name: "Wygrane gości", key: "away", fill: "var(--outcome-away)" },
  { name: "Remisy", key: "draw", fill: "var(--outcome-draw)" },
];

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

function toBar(split: OutcomeSplit, name: string) {
  return {
    name,
    home: pct(split.homeWins, split.matches),
    draw: pct(split.draws, split.matches),
    away: pct(split.awayWins, split.matches),
    matches: split.matches,
  };
}

const WinsByWeatherChart = ({ matches, season }: WinsByWeatherChartProps) => {
  const normal = computeOutcomeSplit(
    matches.filter((m) => m.weather && !isDifficultWeather(m.weather)),
  );
  const difficult = computeOutcomeSplit(
    matches.filter((m) => m.weather && isDifficultWeather(m.weather)),
  );

  const data = [
    toBar(normal, "Normalne warunki"),
    toBar(difficult, "Trudne warunki"),
  ];

  const homeDiff = data[1].home - data[0].home;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy size={18} strokeWidth={2} className="text-primary" />
          Przewaga gospodarzy a pogoda
        </CardTitle>
        <CardDescription className="text-xs">
          <span className="font-bold">
            Wszystkie ligi{season ? `, sezon ${season}` : ""}
          </span>{" "}
          <br />
          Trudne warunki to: mróz, upał, silny deszcz, śnieg lub
          silny wiatr.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="h-36 w-full">
          {/* Wykres % wygranych gospodarzy/gosci/remisow z podzialem na warunki trudne i normalne */}
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={70}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={false}
                formatter={(value) => `${value}%`}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
              {rows.map((row) => (
                <Bar
                  key={row.key}
                  dataKey={row.key}
                  name={row.name}
                  stackId="a"
                  fill={row.fill}
                  barSize={28}
                />
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

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-1 text-right font-normal text-black dark:text-white">Warunki pogodowe: </th>
              <th className="pb-1 text-right font-normal">Normalne</th>
              <th className="pb-1 text-right font-normal">Trudne</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="flex items-center gap-2 py-1 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: row.fill }}
                  />
                  {row.name}
                </td>
                <td className="py-1 text-right font-medium tabular-nums">
                  {data[0][row.key]}%
                </td>
                <td className="py-1 text-right font-medium tabular-nums">
                  {data[1][row.key]}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-muted-foreground">
          {normal.matches} meczów w normalnych warunkach, {difficult.matches} w
          trudnych
        </p>
      </CardContent>
    </Card>
  );
};

export default WinsByWeatherChart;
