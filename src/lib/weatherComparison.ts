import type { MatchWithWeather } from "@/services/matchesService";
import {
  averageCombinedStats,
  getCombinedMatchStats,
  type CombinedStatKey,
} from "./combinedMatchStats";
import { computeTeamStats } from "./teamStats";
import {
  isDifficultWeather,
  profileFor,
  weatherAxes,
  type DifficultCondition,
  type WeatherAxisKey,
} from "./weatherProfile";
import { MIN_MATCHES } from "./weatherScore";

export type ComparisonRow = {
  label: string;
  normal: number;
  condition: number;
  changePct: number | null;
  unit: string;
  decimals: number;
};

export function splitByCondition(
  matches: MatchWithWeather[],
  difficultCondition: DifficultCondition,
) {
  const conditionMatches: MatchWithWeather[] = [];
  const normalMatches: MatchWithWeather[] = [];

  for (const match of matches) {
    if (match.weather === null) continue;

    if (difficultCondition.isMet(profileFor(match.weather))) { 
      conditionMatches.push(match);
    } else if (!isDifficultWeather(match.weather)) {
      normalMatches.push(match);
    }
  }

  return { conditionMatches, normalMatches };
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

export type LeagueStat = {
  key: CombinedStatKey;
  label: string;
  decimals: number;
  unit: string;
};

export const leagueStats: LeagueStat[] = [
  { key: "goals", label: "Gole", decimals: 2, unit: "" },
  { key: "xg", label: "xG", decimals: 2, unit: "" },
  { key: "shots_on_target", label: "Strzały celne", decimals: 1, unit: "" },
  { key: "corner_kicks", label: "Rzuty rożne", decimals: 1, unit: "" },
  { key: "fouls", label: "Faule", decimals: 1, unit: "" },
  { key: "yellow_cards", label: "Żółte kartki", decimals: 1, unit: "" },
  { key: "pass_accuracy_pct", label: "Celność podań", decimals: 1, unit: "%" },
];

export function leagueComparisonRows(
  conditionMatches: MatchWithWeather[],
  normalMatches: MatchWithWeather[],
): ComparisonRow[] {
  const c = averageCombinedStats(conditionMatches.map(getCombinedMatchStats));
  const n = averageCombinedStats(normalMatches.map(getCombinedMatchStats));

  const rows = leagueStats.map((stat) =>
    toRow(stat.label, n[stat.key], c[stat.key], stat.decimals, stat.unit),
  );

  return rows.filter((row) => row !== null);
}

export type BandAverage = {
  label: string;
  matches: number;
  value: number | null;
};

export function bandAverages(
  matches: MatchWithWeather[],
  axisKey: WeatherAxisKey,
  stat: CombinedStatKey,
) {
  const withWeather = matches.filter((match) => match.weather !== null);
  const axis = weatherAxes.find((a) => a.key === axisKey);
  const bands: { value: string; label: string }[] = axis?.bands ?? [];

  const rows: BandAverage[] = bands.map((band) => {
    const inBand = withWeather.filter(
      (match) => match.weather && profileFor(match.weather)[axisKey] === band.value,
    );
    const average = averageCombinedStats(inBand.map(getCombinedMatchStats))[stat];

    return {
      label: band.label,
      matches: inBand.length,
      value: inBand.length >= MIN_MATCHES ? average : null,
    };
  });

  const overall = averageCombinedStats(withWeather.map(getCombinedMatchStats))[stat];

  return { rows, overall };
}

export function teamComparisonRows(
  conditionMatches: MatchWithWeather[],
  normalMatches: MatchWithWeather[],
  teamId: number,
): ComparisonRow[] {
  const c = computeTeamStats(conditionMatches, teamId);
  const n = computeTeamStats(normalMatches, teamId);

  const rows = [
    toRow("Punkty / mecz", n.avg_points, c.avg_points, 2),
    toRow("Gole strzelone", n.avg_goals_scored, c.avg_goals_scored, 2),
    toRow("Gole stracone", n.avg_goals_conceded, c.avg_goals_conceded, 2),
    toRow("xG", n.avg_xg, c.avg_xg, 2),
    toRow("Posiadanie", n.avg_possession, c.avg_possession, 0, "%"),
    toRow("Strzały celne", n.avg_shots_on_target, c.avg_shots_on_target, 1),
    toRow("Faule", n.avg_fouls, c.avg_fouls, 1),
    toRow("Żółte kartki", n.avg_yellow_cards, c.avg_yellow_cards, 1),
  ];

  return rows.filter((row) => row !== null);
}
