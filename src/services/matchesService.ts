import type { Weather, Match, PaginatedResponse, WeatherCondition } from "@/data/types";

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";

export type MatchWithWeather = Match & { weather: Weather | null }

const DEFAULT_MATCHES_LIMIT = 10;

async function getMatchesWithWeather(): Promise<PaginatedResponse<MatchWithWeather>> {
  const data = matches.map(match => ({
    ...match,
    weather: weatherByMatchId.get(match.id) ?? null,
  }));

  return {
    data,
    pagination: {total: data.length, page: 1, limit: data.length, pages: 1 },
  }
}

export async function getRecentMatchesWithWeather(limit = DEFAULT_MATCHES_LIMIT): Promise<MatchWithWeather[]> {
  const {data} = await getMatchesWithWeather();
  return data.sort((a,b) => b.datetime.localeCompare(a.datetime)).slice(0, limit);
}


export type coldestMatchType = {
  city: string | undefined, 
  temperature_c: number, 
  condition: WeatherCondition,
}

export async function getColdestMatchWithWeather(): Promise<coldestMatchType> {
  const matchesWithWeather = []
  
  for (const match of matches) {
    const weather = weatherByMatchId.get(match.id)
    if (!weather) continue

    matchesWithWeather.push({city: match?.stadium?.city, condition: weather.condition, temperature_c: weather.temperature_c})
  }

  return matchesWithWeather.sort((a,b) => a.temperature_c - b.temperature_c)[0]
}