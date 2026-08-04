import type {
  Weather,
  Match,
  PaginatedResponse,
  WeatherCondition,
  MatchStatsSummary,
} from "@/data/types";

import { summary } from "@/data/matchStats";
import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";

const DEFAULT_MATCHES_LIMIT = 10;

export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}

export type MatchWithWeather = Match & { weather: Weather | null };

async function getMatchesWithWeather(): Promise<
  PaginatedResponse<MatchWithWeather>
> {
  const data = matches.map((match) => ({
    ...match,
    weather: weatherByMatchId.get(match.id) ?? null,
  }));

  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length, pages: 1 },
  };
}

export async function getRecentMatchesWithWeather(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatchesWithWeather();
  return data
    .sort((a, b) => b.datetime.localeCompare(a.datetime))
    .slice(0, limit);
}

export type coldestMatchType = {
  city: string | undefined;
  temperature_c: number;
  condition: WeatherCondition;
};

export async function getColdestMatchWithWeather(): Promise<coldestMatchType> {
  const matchesWithWeather = [];

  for (const match of matches) {
    const weather = weatherByMatchId.get(match.id);
    if (!weather) continue;

    matchesWithWeather.push({
      city: match?.stadium?.city,
      condition: weather.condition,
      temperature_c: weather.temperature_c,
    });
  }

  return matchesWithWeather.sort(
    (a, b) => a.temperature_c - b.temperature_c,
  )[0];
}

export type WeatherGoalsStat = {
  condition: WeatherCondition;
  matchCount: number;
  avgGoals: number;
};

export async function getGoalsByWeatherCondition(): Promise<
  WeatherGoalsStat[]
> {
  const buckets = new Map<WeatherCondition, number[]>();

  for (const match of matches) {
    const weather = weatherByMatchId.get(match.id);
    if (!weather) continue;

    const totalGoals = match.home_goals + match.away_goals;
    const bucket = buckets.get(weather.condition) ?? [];
    bucket.push(totalGoals);
    buckets.set(weather.condition, bucket);
  }

  return [...buckets.entries()].map(([condition, goalsList]) => ({
    condition,
    matchCount: goalsList.length,
    avgGoals: Number(
      (goalsList.reduce((sum, g) => sum + g, 0) / goalsList.length).toFixed(1),
    ),
  }));
}

export type WeatherGoalsInsights = {
  bestWeatherForGoals: WeatherGoalsStat;
  worstWeatherForGoals: WeatherGoalsStat;
};

export async function getWeatherGoalsInsights(): Promise<WeatherGoalsInsights> {
  const stats = await getGoalsByWeatherCondition();
  const statsWithData = stats.filter((s) => s.matchCount > 0);
  const sortedStats = [...statsWithData].sort(
    (a, b) => b.avgGoals - a.avgGoals,
  );

  const best = sortedStats[0];
  const worst = sortedStats[sortedStats.length - 1];

  return {
    bestWeatherForGoals: best,
    worstWeatherForGoals: worst,
  };
}

// get team only statistics
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatchesWithWeather();
  const filteredData = data
    .filter((m) => m.home_team_id === teamId || m.away_team_id === teamId)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));
  return [...filteredData];
}
