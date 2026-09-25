import {
  Crosshair,
  Gauge,
  RectangleVertical,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { TeamStats } from "@/lib/teamStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamStatsProps {
  stats: TeamStats;
  baseline: TeamStats | null;
}

type MetricCard = {
  key: keyof TeamStats;
  label: string;
  Icon: LucideIcon;
  decimals: number;
  unit: string;
};

const metrics: MetricCard[] = [
  { key: "win_rate", label: "Win rate", Icon: Trophy, decimals: 0, unit: "%" },
  { key: "avg_goals_scored", label: "Śrd. goli / mecz", Icon: Target, decimals: 2, unit: "" },
  { key: "avg_xg", label: "Śrd. xG / mecz", Icon: Gauge, decimals: 2, unit: "" },
  { key: "avg_possession", label: "Posiadanie piłki", Icon: ShieldCheck, decimals: 0, unit: "%" },
  { key: "avg_shots", label: "Strzały / mecz", Icon: Gauge, decimals: 1, unit: "" },
  { key: "avg_shots_on_target", label: "Strzały na bramkę", Icon: Crosshair, decimals: 1, unit: "" },
  { key: "avg_yellow_cards", label: "Żółte kartki / mecz", Icon: RectangleVertical, decimals: 1, unit: "" },
  { key: "avg_fouls", label: "Faule / mecz", Icon: Swords, decimals: 1, unit: "" },
];

function formatMetricCard(
  value: number | null,
  baselineValue: number | null,
  decimals: number,
  unit: string,
  emptyMessage: string,
) {
  const displayValue = value !== null ? `${value.toFixed(decimals)}${unit}` : "—";

  const delta =
    value !== null && baselineValue !== null ? value - baselineValue : null;

  const deltaText =
    delta === null
      ? emptyMessage
      : delta === 0
        ? "W linii ze średnią."
        : `${delta > 0 ? "+" : ""}${delta.toFixed(decimals)}${unit} vs. średnia`;

  const deltaClass =
    delta === null || delta === 0
      ? "text-muted-foreground"
      : delta > 0
        ? "text-green-600 dark:text-green-500/90"
        : "text-destructive";

  return { displayValue, deltaText, deltaClass };
}

const TeamStatsCards = ({ stats, baseline }: TeamStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-2">
      {metrics.map((metric) => {
        const { displayValue, deltaText, deltaClass } = formatMetricCard(
          stats[metric.key],
          baseline === null ? null : baseline[metric.key],
          metric.decimals,
          metric.unit,
          baseline === null
            ? "Wybierz warunki pogodowe"
            : "Brak danych do porównania",
        );

        return (
          <Card key={metric.key} className="gap-3 py-5 break-inside-avoid">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <metric.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-2xl font-bold tabular-nums">{displayValue}</p>
              <p className={`text-xs ${deltaClass}`}>{deltaText}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeamStatsCards;
