import type { Weather, Match } from "@/data/types";

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";

type MatchWithWeather = Match & { weather: Weather}

export function getMatchesWithWeather(): MatchWithWeather[] {
  return matches.map(match => {
    const matchWeather = weatherByMatchId.get(match.id);
    if (!matchWeather) {
      throw new Error(`Brak pogody dla meczu ${match.id}`);
    }

    return {...match, weather: matchWeather}
  });
}
