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
import {
  difficultConditionsText,
  isDifficultWeather,
} from "@/lib/weatherProfile";
import { computeOutcomeSplit, type OutcomeSplit } from "@/lib/matchOutcomes";
import { weatherConditionStyles } from "@/lib/weatherStylesConfig";

import DashboardChartCard from "./DashboardChartCard";
import WeatherConditionLabel from "./WeatherConditionLabel";

interface WinsByWeatherChartProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const outcomes: { short: string; key: "home" | "draw" | "away" }[] = [
  { short: "Gospodarze", key: "home" },
  { short: "Goście", key: "away" },
  { short: "Remisy", key: "draw" },
];

const series = (["normal", "difficult"] as const).map((key) => ({
  key,
  name: weatherConditionStyles[key].label,
  fill: weatherConditionStyles[key].color,
}));

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const toPcts = (split: OutcomeSplit) => ({
  home: pct(split.homeWins, split.matches),
  draw: pct(split.draws, split.matches),
  away: pct(split.awayWins, split.matches),
});

const WinsByWeatherChart = ({
  matches,
  isPending,
  isError,
}: WinsByWeatherChartProps) => {
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
    <DashboardChartCard
      Icon={Trophy}
      title="Wyniki meczów a pogoda"
      topic="kto wygrywa"
      isPending={isPending}
      isError={isError}
      isEmpty={normal.matches === 0 || difficult.matches === 0}
      insight={
        homeDiff === 0 ? (
          "Pogoda nie zmienia odsetka wygranych gospodarzy."
        ) : (
          <>
            W trudnej pogodzie gospodarze wygrywają{" "}
            <span className="font-semibold text-foreground">
              o {Math.abs(homeDiff)} na 100 meczów{" "}
              {homeDiff > 0 ? "częściej" : "rzadziej"}
            </span>
            .
          </>
        )
      }
      footnote={
        <>
          Trudna pogoda to: {difficultConditionsText}. {normal.matches} meczów w
          normalnej, {difficult.matches} w trudnej.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="h-52 w-full">
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

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <WeatherConditionLabel key={s.key} kind={s.key} />
          ))}
        </div>
      </div>
    </DashboardChartCard>
  );
};

export default WinsByWeatherChart;
