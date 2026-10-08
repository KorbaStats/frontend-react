import type { MatchWithWeather } from "@/services/matchesService";
import {
  averageCombinedStats,
  getCombinedMatchStats,
} from "./combinedMatchStats";
import { computeTeamStats } from "./teamStats";
import {
  difficultConditions,
  isDifficultWeather,
  profileFor,
  type DifficultCondition,
} from "./weatherProfile";

export type ComparisonRow = {
  label: string;
  normal: number;
  condition: number;
  changePct: number | null;
  unit: string;
  decimals: number;
};

export type ConditionSplit = {
  condition: MatchWithWeather[];
  normal: MatchWithWeather[];
};

export type ConditionCount = {
  condition: DifficultCondition;
  count: number;
};

export function splitByCondition(
  matches: MatchWithWeather[],
  condition: DifficultCondition,
): ConditionSplit {
  const withWeather = matches.filter((match) => match.weather !== null);

  return {
    condition: withWeather.filter((match) =>
      condition.matches(profileFor(match.weather!)),
    ),
    normal: withWeather.filter((match) => !isDifficultWeather(match.weather!)),
  };
}

export function countByCondition(
  matches: MatchWithWeather[],
): ConditionCount[] {
  const profiles = matches
    .filter((match) => match.weather !== null)
    .map((match) => profileFor(match.weather!));

  return difficultConditions.map((condition) => ({
    condition,
    count: profiles.filter(condition.matches).length,
  }));
}

function toRow(
  label: string,
  normal: number | null,
  condition: number | null,
  decimals: number,
  unit = "",
): ComparisonRow | null {
  if (normal === null || condition === null) return null;

  return {
    label,
    normal,
    condition,
    changePct: normal === 0 ? null : ((condition - normal) / normal) * 100,
    unit,
    decimals,
  };
}

const isRow = (row: ComparisonRow | null): row is ComparisonRow => row !== null;

export function leagueComparisonRows(
  condition: MatchWithWeather[],
  normal: MatchWithWeather[],
): ComparisonRow[] {
  const c = averageCombinedStats(condition.map(getCombinedMatchStats));
  const n = averageCombinedStats(normal.map(getCombinedMatchStats));

  return [
    toRow("Gole", n.goals, c.goals, 2),
    toRow("xG", n.xg, c.xg, 2),
    toRow("Strzały celne", n.shots_on_target, c.shots_on_target, 1),
    toRow("Rzuty rożne", n.corner_kicks, c.corner_kicks, 1),
    toRow("Faule", n.fouls, c.fouls, 1),
    toRow("Żółte kartki", n.yellow_cards, c.yellow_cards, 1),
    toRow("Celność podań", n.pass_accuracy_pct, c.pass_accuracy_pct, 1, "%"),
  ].filter(isRow);
}

export function teamComparisonRows(
  condition: MatchWithWeather[],
  normal: MatchWithWeather[],
  teamId: number,
): ComparisonRow[] {
  const c = computeTeamStats(condition, teamId);
  const n = computeTeamStats(normal, teamId);

  return [
    toRow("Punkty / mecz", n.avg_points, c.avg_points, 2),
    toRow("Gole strzelone", n.avg_goals_scored, c.avg_goals_scored, 2),
    toRow("Gole stracone", n.avg_goals_conceded, c.avg_goals_conceded, 2),
    toRow("xG", n.avg_xg, c.avg_xg, 2),
    toRow("Posiadanie", n.avg_possession, c.avg_possession, 0, "%"),
    toRow("Strzały celne", n.avg_shots_on_target, c.avg_shots_on_target, 1),
    toRow("Faule", n.avg_fouls, c.avg_fouls, 1),
    toRow("Żółte kartki", n.avg_yellow_cards, c.avg_yellow_cards, 1),
  ].filter(isRow);
}
