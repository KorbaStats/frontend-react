import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartColumnIncreasing } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";

import StatRow, { type NumberRowProps } from "./StatRow";
import ParsedStatRow, { type ParsedRowProps } from "./ParsedStatRow";

interface MatchStatsProps {
  match: MatchWithWeather;
}

type Row =
  | ({ kind: "number" } & NumberRowProps)
  | ({ kind: "parsed" } & ParsedRowProps);

const MatchStats = ({ match }: MatchStatsProps) => {
  const rows: Row[] = [
    {
      kind: "number",
      label: "Oczekiwane gole (xG)",
      home: match.home_expected_goals_xg,
      away: match.away_expected_goals_xg,
      decimals: 2,
    },
    {
      kind: "number",
      label: "Posiadanie piłki",
      home: match.home_ball_possession,
      away: match.away_ball_possession,
      suffix: "%",
    },
    {
      kind: "parsed",
      label: "Podania",
      home: match.home_passes,
      away: match.away_passes,
    },
    {
      kind: "number",
      label: "Strzały łącznie",
      home: match.home_total_shots,
      away: match.away_total_shots,
    },
    {
      kind: "number",
      label: "Strzały celne",
      home: match.home_shots_on_target,
      away: match.away_shots_on_target,
    },
    {
      kind: "number",
      label: "Rzuty rożne",
      home: match.home_corner_kicks,
      away: match.away_corner_kicks,
    },
    {
      kind: "number",
      label: "Faule",
      home: match.home_fouls,
      away: match.away_fouls,
    },
    {
      kind: "number",
      label: "Żółte kartki",
      home: match.home_yellow_cards,
      away: match.away_yellow_cards,
    },
  ];

  return (
    <Card>
      <CardHeader className="my-0">
        <CardTitle className="flex items-center gap-2">
          <ChartColumnIncreasing size={16} className="text-primary" />
          <h1>Top Statystyki</h1>
        </CardTitle>
        <div className="flex items-center gap-2">
          <h2 className="text-xs text-primary">{match.homeTeam.name}</h2>
          <span className="block bg-primary w-1.5 h-1.5 rounded-full"></span>

          <h2 className="text-xs text-foreground/80">{match.awayTeam.name}</h2>
          <span className="block bg-foreground/80 w-1.5 h-1.5 rounded-full"></span>
        </div>
      </CardHeader>
      <CardContent>
        {/* liczby i etykieta */}
        {rows.map((row) =>
          row.kind === "parsed" ? (
            <ParsedStatRow key={row.label} {...row} />
          ) : (
            <StatRow key={row.label} {...row} />
          ),
        )}
      </CardContent>
    </Card>
  );
};

export default MatchStats;
