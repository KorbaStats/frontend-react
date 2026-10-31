import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartLine,
  CloudRain,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import type { CombinedStatKey } from "@/lib/combinedMatchStats";
import { weatherAxes } from "@/lib/weatherProfile";
import { MIN_MATCHES } from "@/lib/weatherComparison";
import {
  bandAverages,
  leagueStats,
  type BandAverage,
} from "@/lib/weatherComparison";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherBandTrendChartProps {
  matches: MatchWithWeather[];
  description: string;
}

type TrendAxisKey = "temp" | "precip";

const axisIcons: Record<TrendAxisKey, LucideIcon> = {
  temp: Thermometer,
  precip: CloudRain,
};

const trendAxes = weatherAxes.filter(
  (
    axis,
  ): axis is Extract<(typeof weatherAxes)[number], { key: TrendAxisKey }> =>
    axis.key === "temp" || axis.key === "precip",
);

const WeatherBandTrendChart = ({
  matches,
  description,
}: WeatherBandTrendChartProps) => {
  const [axisKey, setAxisKey] = useState<TrendAxisKey>("temp");
  const [statKey, setStatKey] = useState<CombinedStatKey>("goals");

  const stat = leagueStats.find((s) => s.key === statKey) ?? leagueStats[0];
  const { rows, overall } = bandAverages(matches, axisKey, stat.key);
  const hasData = rows.some((row) => row.value !== null);

  const format = (value: number) =>
    `${value.toFixed(stat.decimals)}${stat.unit}`;

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="flex flex-col gap-3 border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartLine className="h-4 w-4 text-primary" />
            Statystyki w pasmach pogodowych
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex flex-wrap gap-2">
            {trendAxes.map((axis) => {
              const Icon = axisIcons[axis.key];
              const active = axis.key === axisKey;

              return (
                <Button
                  key={axis.key}
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                  className="rounded-full"
                  aria-pressed={active}
                  onClick={() => setAxisKey(axis.key)}
                >
                  <Icon />
                  {axis.label}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {leagueStats.map((s) => {
              const active = s.key === stat.key;

              return (
                <Button
                  key={s.key}
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                  className="rounded-full"
                  aria-pressed={active}
                  onClick={() => setStatKey(s.key)}
                >
                  {s.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {!hasData ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Za mało meczów w pasmach pogodowych, żeby pokazać przebieg.
          </p>
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart
                  data={rows}
                  margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    height={44}
                    interval={0}
                    padding={{ left: 40, right: 40 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                    tick={({ x, y, index }) => {
                      const row = rows[index];
                      if (!row) return <g />;

                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            dy={14}
                            textAnchor="middle"
                            fontSize={12}
                            fill="var(--foreground)"
                          >
                            {axisKey === 'temp' ? `${row.label}°C` : row.label}
                          </text>
                          <text
                            dy={30}
                            textAnchor="middle"
                            fontSize={11}
                            fill="var(--muted-foreground)"
                            className="tabular-nums"
                          >
                            {row.value === null
                              ? `${row.matches} mecz · za mało`
                              : `${row.matches} meczy`}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    width={48}
                    domain={[
                      (min: number) => Math.floor(min * 0.85),
                      (max: number) => Math.ceil(max * 1.1),
                    ]}
                    tickCount={5}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value: number) => `${value}${stat.unit}`}
                  />
                  {overall !== null && (
                    <ReferenceLine
                      y={overall}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                      label={{
                        value: `średnia ${format(overall)}`,
                        position: "insideTopRight",
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Tooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 2 }}
                    content={({ active, payload }) => {
                      const row = payload?.[0]?.payload as
                        | BandAverage
                        | undefined;
                      if (!active || !row) return null;

                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
                          <p className="mb-1 font-medium">{row.label}</p>
                          {row.value === null ? (
                            <p className="text-muted-foreground">
                              Za mało meczów (min. {MIN_MATCHES})
                            </p>
                          ) : (
                            <p>
                              {stat.label}:{" "}
                              <span className="font-medium tabular-nums">
                                {format(row.value)}
                              </span>
                            </p>
                          )}
                          <p>
                            Mecze:{" "}
                            <span className="font-medium tabular-nums">
                              {row.matches}
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{
                      r: 5,
                      fill: "var(--primary)",
                      stroke: "var(--card)",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--primary)",
                      stroke: "var(--card)",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground">
              Średnia na mecz (obie drużyny razem). Pasma z mniej niż{" "}
              {MIN_MATCHES} meczami pominięte. Linia przerywana to średnia z
              całego sezonu.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherBandTrendChart;
