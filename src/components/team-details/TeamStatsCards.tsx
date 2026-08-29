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
  // null, gdy nie wybrano warunków — wtedy delty byłyby zerowe
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <Card key={metric.key}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{metric.label}</CardTitle>
              <metric.Icon size={16} />
            </CardHeader>
            <CardContent>
              <h1 className="text-3xl font-bold">{displayValue}</h1>
              <h2 className={`text-sm ${deltaClass}`}>{deltaText}</h2>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeamStatsCards;
