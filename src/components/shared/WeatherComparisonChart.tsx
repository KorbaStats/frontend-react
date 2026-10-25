import { useState } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartBar } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  difficultConditions,
  type DifficultConditionKey,
} from "@/lib/weatherProfile";
import { MIN_MATCHES } from "@/lib/weatherScore";
import {
  leagueComparisonRows,
  splitByCondition,
  teamComparisonRows,
  type ComparisonRow,
} from "@/lib/weatherComparison";
import { conditionIcons } from "@/lib/weatherStylesConfig";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherComparisonChartProps {
  matches: MatchWithWeather[];
  teamId?: number;
  title: string;
  description: string;
}

const ROW_HEIGHT = 30;

const formatValue = (row: ComparisonRow, value: number) =>
  `${value.toFixed(row.decimals)}${row.unit}`;

const formatChange = (changePct: number | null) => {
  if (changePct === null) return "—";
  const rounded = Math.round(changePct);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

const WeatherComparisonChart = ({
  matches,
  teamId,
  title,
  description,
}: WeatherComparisonChartProps) => {
  const [selectedKey, setSelectedKey] = useState<DifficultConditionKey | null>(null);

  const available = difficultConditions
    .map((condition) => ({ condition, split: splitByCondition(matches, condition) }))
    .filter(({ split }) => split.conditionMatches.length >= MIN_MATCHES);

  const selected =
    available.find(({ condition }) => condition.key === selectedKey) ?? available[0];
  const hasNormal =
    selected !== undefined && selected.split.normalMatches.length >= MIN_MATCHES;

  let rows: ComparisonRow[] = [];
  if (selected && hasNormal) {
    const { conditionMatches, normalMatches } = selected.split;
    rows =
      teamId === undefined
        ? leagueComparisonRows(conditionMatches, normalMatches)
        : teamComparisonRows(conditionMatches, normalMatches, teamId);
  }

  const data = rows.map((row) => ({ ...row, value: row.changePct ?? 0 }));
  const biggestChange = Math.max(...data.map((d) => Math.abs(d.value)), 10);
  const scale = biggestChange + 10;

  const placeholder = !selected
    ? "Za mało meczów w trudnych warunkach, żeby porównać."
    : "Za mało meczów w normalnych warunkach, żeby porównać.";

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="flex flex-col gap-3 border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartBar className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {available.map(({ condition, split }) => {
            const Icon = conditionIcons[condition.key];
            const active = selected?.condition.key === condition.key;

            return (
              <Button
                key={condition.key}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={active}
                onClick={() => setSelectedKey(condition.key)}
              >
                <Icon />
                {condition.label}
                <span className="tabular-nums text-muted-foreground">
                  · {split.conditionMatches.length}
                </span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {!selected || !hasNormal ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <>
            <div className="w-full" style={{ height: data.length * ROW_HEIGHT }}>
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={data}
                  margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                >
                  <XAxis type="number" domain={[-scale, scale]} hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <ReferenceLine x={0} stroke="var(--border)" strokeWidth={2} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                    content={({ active, payload }) => {
                      const row = payload?.[0]?.payload as ComparisonRow | undefined;
                      if (!active || !row) return null;

                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
                          <p className="mb-1 font-medium">{row.label}</p>
                          <p>
                            Normalna pogoda:{" "}
                            <span className="font-medium tabular-nums">
                              {formatValue(row, row.normal)}
                            </span>
                          </p>
                          <p>
                            {selected.condition.label}:{" "}
                            <span className="font-medium tabular-nums">
                              {formatValue(row, row.condition)}
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--primary)"
                    radius={3}
                    barSize={14}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="value"
                      content={({ x, y, width, height, index }) => {
                        if (index === undefined) return null;
                        const row = data[index];
                        const barEnd = Number(x) + Number(width);
                        const positive = row.value >= 0;

                        return (
                          <text
                            x={positive ? barEnd + 6 : barEnd - 6}
                            y={Number(y) + Number(height) / 2}
                            dy={4}
                            textAnchor={positive ? "start" : "end"}
                            fontSize={12}
                            fill="var(--foreground)"
                            className="tabular-nums"
                          >
                            {formatChange(row.changePct)}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground">
              {selected.split.normalMatches.length} meczów w normalnych warunkach pogodowych. Warunki mogą się nakładać — mecz w mrozie ze śniegiem liczy się do obu.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherComparisonChart;
