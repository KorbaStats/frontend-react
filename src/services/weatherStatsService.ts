// INVENTED CONTRACT — nothing in this file mirrors an existing endpoint.
//
// The backend has no weather data whatsoever (no table, no column, no route —
// grepped 2026-08-05), so these aggregates are the frontend's own proposal for
// what a future weather-stats API should return. They are shaped as async
// service calls rather than pure helpers on purpose: each one needs the FULL
// match set, which a real client would never download just to average a few
// numbers, so these are the ones that genuinely belong on the server.
//
// Proposed endpoints:
//   GET /api/weather-stats/goals-by-condition  → WeatherGoalsStat[]
//   GET /api/weather-stats/insights            → WeatherGoalsInsights
//   GET /api/weather-stats/coldest-match       → ColdestMatch
//
// Contrast with lib/: anything derived from matches a component ALREADY
// fetched (e.g. filtering a single team's games by condition) stays a pure
// function in lib/, because no server round-trip could justify itself there.
//TODO: verify against real API response once the backend has weather

import { getMatches } from "@/services/matchesService";
import type { WeatherCondition } from "@/data/types";

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

/** GET /api/weather-stats/goals-by-condition */
export async function getGoalsByWeatherCondition(): Promise<
  WeatherGoalsStat[]
> {
  const { data } = await getMatches();
  const buckets = new Map<WeatherCondition, number[]>();

  for (const match of data) {
    if (!match.weather) continue;

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
