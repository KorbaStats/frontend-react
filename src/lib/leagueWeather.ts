import type { MatchWithWeather } from "@/services/matchesService"
import { precipBandFor } from "./weatherProfile"

export type LeagueWeatherSummary = {
  avgTemp: number
  avgWind: number
  precipPct: number
  matchesCount: number
}

const round1 = (value: number) => Math.round(value * 10) / 10

export function computeLeagueWeatherSummary(
  matches: MatchWithWeather[],
): LeagueWeatherSummary | null {
  let count = 0
  let tempSum = 0
  let windSum = 0
  let precipCount = 0

  for (const { weather } of matches) {
    if (!weather) continue
    count++
    tempSum += weather.temperature_c
    windSum += weather.wind_speed_kmh
    if (precipBandFor(weather.precipitation_mm, weather.temperature_c) !== "dry") precipCount++
  }

  if (count === 0) return null

  return {
    avgTemp: round1(tempSum / count),
    avgWind: round1(windSum / count),
    precipPct: Math.round((precipCount / count) * 100),
    matchesCount: count,
  }
}
