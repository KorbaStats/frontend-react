// najlepsza pogoda dla goli - jaka pogoda jest najlepsza do bramek (czyli najwiecej srednich bramek dla danej pogody)
// najgorsza pogoda dla goli - nnajmniej

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";

import type { WeatherCondition } from "@/data/types";

export type WeatherGoalsStat = {
  condition: WeatherCondition
  matchCount: number
  avgGoals: number
};

export async function getGoalsByWeatherCondition(): Promise<WeatherGoalsStat[]> {
  const buckets = new Map<WeatherCondition, number[]>()

  for (const match of matches) {
    const weather = weatherByMatchId.get(match.id)
    if (!weather) continue

    const totalGoals = match.home_goals + match.away_goals
    const bucket = buckets.get(weather.condition) ?? []
    bucket.push(totalGoals)
    buckets.set(weather.condition, bucket)
  }

  return [...buckets.entries()].map(([condition, goalsList]) => ({
    condition,
    matchCount: goalsList.length,
    avgGoals: Number((goalsList.reduce((sum, g) => sum + g, 0) / goalsList.length).toFixed(1)),
  }))
}

export type WeatherGoalsInsights = {
  best: WeatherGoalsStat
  worst: WeatherGoalsStat
  spread: number
}

export async function getWeatherGoalsInsights(): Promise<WeatherGoalsInsights> {
  const stats = await getGoalsByWeatherCondition()
  const statsWithData = stats.filter((s) => s.matchCount > 0);
  const sortedStats = [...statsWithData].sort((a,b) => b.avgGoals - a.avgGoals);

  const best = sortedStats[0]
  const worst = sortedStats[sortedStats.length - 1]
  const spread = best.avgGoals - worst.avgGoals

  return {
    best,
    worst,
    spread
  }
}