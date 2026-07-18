import type { Weather, Match } from "@/data/types";

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";

export type MatchWithWeather = Match & { weather: Weather | null }

const DEFAULT_MATCHES_LIMIT = 10;

export async function getMatchesWithWeather(): Promise<MatchWithWeather[]> {
  return matches.map(match => ({
    ...match,
    weather: weatherByMatchId.get(match.id) ?? null,
  }));
}

export async function getRecentMatchesWithWeather(limit = DEFAULT_MATCHES_LIMIT): Promise<MatchWithWeather[]> {
  const all = await getMatchesWithWeather();
  return all.sort((a,b) => b.datetime.localeCompare(a.datetime)).slice(0, limit);
}