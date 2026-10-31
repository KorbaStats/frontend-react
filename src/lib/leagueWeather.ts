import type { MatchWithWeather } from "@/services/matchesService";
import { precipBandFor } from "./weatherProfile";

export type LeagueWeatherSummary = {
  avgTemp: number;
  avgWind: number;
  precipPct: number;
  matchesCount: number;
};

export function computeLeagueWeatherSummary(
  matches: MatchWithWeather[],
): LeagueWeatherSummary | null {
  let count = 0;
  let tempSum = 0;
  let windSum = 0;
  let precipCount = 0;

  for (const { weather } of matches) {
    if (!weather) continue;
    count++;
    tempSum += weather.temperature_c;
    windSum += weather.wind_speed_kmh;
    if (
      precipBandFor(weather.precipitation_mm) !== "dry"
    )
      precipCount++;
  }

  if (count === 0) return null;

  return {
    avgTemp: tempSum / count,
    avgWind: windSum / count,
    precipPct: Math.round((precipCount / count) * 100),
    matchesCount: count,
  };
}
