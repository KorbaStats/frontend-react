// Agregaty pogodowe. Backend nie ma danych pogodowych (brak tabeli, kolumny
// i route'a — sprawdzone 2026-08-05), więc poniższe endpointy to propozycja
// kształtu przyszłego API. Każda funkcja potrzebuje pełnego zbioru meczów,
// dlatego są w services/, a nie w lib/.
//
// Proponowane endpointy:
//   GET /api/weather-stats/goals-by-condition -> WeatherGoalsStat[]
//   GET /api/weather-stats/insights           -> WeatherGoalsInsights
//   GET /api/weather-stats/coldest-match      -> ColdestMatch
//   GET /api/weather-stats/match-averages     -> ConditionAverages
//   GET /api/weather-stats/percentiles        -> WeatherPercentile[]
//   GET /api/teams/:id/weather-score?season=  -> WeatherScore | null
//TODO: verify against real API response once the backend has weather

import { getMatches, getTeamMatches } from "@/services/matchesService";
import type { WeatherCondition } from "@/data/types";
import {
  averageCombinedStats,
  getCombinedMatchStats,
  type CombinedMatchStats,
} from "@/lib/combinedMatchStats";
 import { type WeatherScore, computeWeatherScore } from "@/lib/weatherScore";

export type WeatherGoalsStat = {
  condition: WeatherCondition;
  matchCount: number;
  avgGoals: number;
};

export type WeatherGoalsInsights = {
  bestWeatherForGoals: WeatherGoalsStat;
  worstWeatherForGoals: WeatherGoalsStat;
};

export type ColdestMatch = {
  city: string | undefined;
  temperature_c: number;
  condition: WeatherCondition;
};

/**
 * GET /api/weather-stats/goals-by-condition?league_id=1
 *
 * Bez `leagueId` średnia miesza ligi, które różnią się liczbą goli na mecz.
 * Pogoda koreluje z ligą (śnieg pada w Polsce, nie w Hiszpanii).
 */
export async function getGoalsByWeatherCondition(
  leagueId?: number,
): Promise<WeatherGoalsStat[]> {
  const { data } = await getMatches();
  const buckets = new Map<WeatherCondition, number[]>();

  for (const match of data) {
    if (!match.weather) continue;
    if (leagueId !== undefined && match.league_id !== leagueId) continue;

    const totalGoals = match.home_goals + match.away_goals;
    const bucket = buckets.get(match.weather.condition) ?? [];
    bucket.push(totalGoals);
    buckets.set(match.weather.condition, bucket);
  }

  return [...buckets.entries()].map(([condition, goalsList]) => ({
    condition,
    matchCount: goalsList.length,
    avgGoals: Number(
      (goalsList.reduce((sum, g) => sum + g, 0) / goalsList.length).toFixed(1),
    ),
  }));
}

/** GET /api/weather-stats/insights */
export async function getWeatherGoalsInsights(): Promise<WeatherGoalsInsights> {
  const stats = await getGoalsByWeatherCondition();
  const sortedStats = stats
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.avgGoals - a.avgGoals);

  return {
    bestWeatherForGoals: sortedStats[0],
    worstWeatherForGoals: sortedStats[sortedStats.length - 1],
  };
}

export type ConditionAverages = {
  condition: WeatherCondition;
  /** Liczba meczów, z których liczone są średnie. */
  matchCount: number;
  averages: CombinedMatchStats;
};

/**
 * GET /api/weather-stats/match-averages?condition=rain&league_id=1
 *
 * Średnie statystyki meczu przy danym warunku pogodowym, obie drużyny razem.
 */
export async function getMatchAveragesByCondition(
  condition: WeatherCondition,
  leagueId?: number,
): Promise<ConditionAverages> {
  const { data } = await getMatches();

  const statsList = data
    .filter(
      (match) =>
        match.weather?.condition === condition &&
        (leagueId === undefined || match.league_id === leagueId),
    )
    .map(getCombinedMatchStats);

  return {
    condition,
    matchCount: statsList.length,
    averages: averageCombinedStats(statsList),
  };
}

export type WeatherMetricKey =
  | "temperature_c"
  | "wind_speed_kmh"
  | "precipitation_mm"
  | "humidity_pct";

export type WeatherPercentile = {
  metric: WeatherMetricKey;
  /** Wartość z tego meczu. */
  value: number;
  /** 0-100, gdzie 50 to mediana rozkładu. */
  percentile: number;
  /** Mediana metryki w lidze. */
  median: number;
  min: number;
  max: number;
  matchCount: number;
};

const percentileMetrics: WeatherMetricKey[] = [
  "temperature_c",
  "wind_speed_kmh",
  "precipitation_mm",
  "humidity_pct",
];

// Remisy liczone w połowie, żeby powtarzalne wartości (np. 0 mm opadów) nie
// zawyżały percentyla.
function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;

  const below = values.filter((v) => v < value).length;
  const equal = values.filter((v) => v === value).length;

  return ((below + equal / 2) / values.length) * 100;
}

// Mediana - odpowiada normie w danej lidze
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * GET /api/weather-stats/percentiles?match_id=X&league_id=Y
 *
 * Pozycja warunków tego meczu w rozkładzie wszystkich meczów ligi.
 */
export async function getWeatherPercentiles(
  matchId: number,
  leagueId?: number,
): Promise<WeatherPercentile[]> {
  const { data } = await getMatches();

  const match = data.find((m) => m.id === matchId);
  if (!match?.weather) return [];

  const population = data.filter(
    (m) =>
      m.weather !== null &&
      (leagueId === undefined || m.league_id === leagueId),
  );

  return percentileMetrics.map((metric) => {
    const values = population.map((m) => m.weather![metric]);
    const value = match.weather![metric];

    return {
      metric,
      value,
      percentile: percentileRank(values, value),
      median: median(values),
      min: Math.min(...values),
      max: Math.max(...values),
      matchCount: values.length,
    };
  });
}

/** GET /api/weather-stats/coldest-match */
export async function getColdestMatch(): Promise<ColdestMatch> {
  const { data } = await getMatches();

  return data
    .filter((match) => match.weather !== null)
    .map((match) => ({
      city: match.stadium?.city,
      condition: match.weather!.condition,
      temperature_c: match.weather!.temperature_c,
    }))
    .sort((a, b) => a.temperature_c - b.temperature_c)[0];
}

/** GET /api/teams/:id/weather-score?season=2025/2026 */
export async function getTeamWeatherScore(
  teamId: number,
  season?: string | null,
): Promise<WeatherScore | null> {
  const teamMatches = await getTeamMatches(teamId);
  const scoped = season
    ? teamMatches.filter((match) => match.season === season)
    : teamMatches;

  return computeWeatherScore(scoped, teamId);
}