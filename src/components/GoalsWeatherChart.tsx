import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { BarChart3 } from "lucide-react";

import { getGoalsByWeatherCondition } from "@/services/matchStatsService";
import { weatherConfig } from "@/lib/weatherConfig";

type ChartRow = {
  label: string;
  avgGoals: number;
  matchCount: number;
};

const GoalsWeatherChart = () => {
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGoalsByWeatherCondition()
      .then((stats) => {
        const rows = stats
          .filter((s) => s.matchCount > 0)
          .map((s) => ({
            label: weatherConfig[s.condition].label,
            avgGoals: s.avgGoals,
            matchCount: s.matchCount,
          }))
          .sort((a, b) => b.avgGoals - a.avgGoals);
        setChartData(rows);
      })
      .catch((err) => {
        setError("Nie udało się pobrać danych do wykresu.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie wykresu...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <CardTitle className="text-base">Średnia goli a warunki pogodowe</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              formatter={(value, name) =>
                name === "avgGoals" ? [`${value} gola/mecz`, "Średnia"] : value
              }
              cursor={{fill: "var(--muted)", opacity: 0.5}}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="avgGoals" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GoalsWeatherChart;