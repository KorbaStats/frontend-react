import type { ParsedStat } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";

export type CombinedMatchStats = {
  goals: number | null;
  xg: number | null;
  shots_on_target: number | null;
  corner_kicks: number | null;
  yellow_cards: number | null;
  fouls: number | null;
  goalkeeper_saves: number | null;
  pass_accuracy_pct: number | null;
};

export type CombinedStatKey = keyof CombinedMatchStats;

function sumOptional(
  home: number | null | undefined,
  away: number | null | undefined,
): number | null {
  if (home == null && away == null) return null;
  return (home ?? 0) + (away ?? 0);
}

function combinedAccuracy(
  home: ParsedStat | null | undefined,
  away: ParsedStat | null | undefined,
): number | null {
  const completed = (home?.completed ?? 0) + (away?.completed ?? 0);
  const total = (home?.total ?? 0) + (away?.total ?? 0);

  if (total === 0) return null;
  return (completed / total) * 100;
}

export function getCombinedMatchStats(
  match: MatchWithWeather,
): CombinedMatchStats {
  return {
    goals: match.home_goals + match.away_goals,
    xg: sumOptional(match.home_expected_goals_xg, match.away_expected_goals_xg),
    shots_on_target: sumOptional(
      match.home_shots_on_target,
      match.away_shots_on_target,
    ),
    corner_kicks: sumOptional(match.home_corner_kicks, match.away_corner_kicks),
    yellow_cards: sumOptional(match.home_yellow_cards, match.away_yellow_cards),
    fouls: sumOptional(match.home_fouls, match.away_fouls),
    goalkeeper_saves: sumOptional(
      match.home_goalkeeper_saves,
      match.away_goalkeeper_saves,
    ),
    pass_accuracy_pct: combinedAccuracy(match.home_passes, match.away_passes),
  };
}

export function averageCombinedStats(
  statsList: CombinedMatchStats[],
): CombinedMatchStats {
  const average = (key: CombinedStatKey): number | null => {
    const values = statsList
      .map((stats) => stats[key])
      .filter((value): value is number => value !== null);

    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return {
    goals: average("goals"),
    xg: average("xg"),
    shots_on_target: average("shots_on_target"),
    corner_kicks: average("corner_kicks"),
    yellow_cards: average("yellow_cards"),
    fouls: average("fouls"),
    goalkeeper_saves: average("goalkeeper_saves"),
    pass_accuracy_pct: average("pass_accuracy_pct"),
  };
}
