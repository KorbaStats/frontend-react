// Mocked data - change later for backend endpoints
// Invented contract: the backend has no weather data at all yet. Every field
// here is a guess at what such an endpoint could return, correlated with the
// match dates in matches.ts so the "weather score" feature (see CLAUDE.md)
// has something plausible to chart against.
//TODO: verify against real API response

import { matches } from "./matches"
import type { Weather, WeatherCondition } from "./types"

function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(7)

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 1): number {
  return Number((rng() * (max - min) + min).toFixed(decimals))
}

// function clamp(value: number, min: number, max: number): number {
//   return Math.min(max, Math.max(min, value))
// }

// Rough monthly temperature bands — all mocked matches fall between
// November and April (see matches.ts season definitions).
const monthTempRange: Record<number, [number, number]> = {
  11: [4, 14],
  12: [-2, 8],
  1: [-4, 6],
  2: [-3, 7],
  3: [2, 12],
  4: [6, 16],
}

function conditionFor(temperature: number, precipitation: number, wind: number, cloudCover: number): WeatherCondition {
  if (temperature <= 0 && precipitation > 0.5) return "snow"
  if (temperature <= -3) return "extreme_cold"
  if (precipitation > 2) return "rain"
  if (wind > 35) return "wind"
  if (temperature >= 28) return "extreme_heat"
  if (cloudCover > 60) return "clouds"
  return "clear"
}

export const weather: Weather[] = matches.map((match) => {
  const month = Number(match.datetime.slice(5, 7))
  const [minTemp, maxTemp] = monthTempRange[month] ?? [5, 20]
  const temperature_c = randFloat(minTemp, maxTemp)
  const precipitation_mm = rng() < 0.35 ? randFloat(0.5, 12) : 0
  const wind_speed_kmh = randFloat(5, 45)
  const humidity_pct = randInt(40, 95)
  const cloud_cover_pct = randInt(0, 100)

  return {
    match_id: match.id,
    temperature_c,
    feels_like_c: Number((temperature_c - wind_speed_kmh / 15).toFixed(1)),
    precipitation_mm,
    wind_speed_kmh,
    humidity_pct,
    cloud_cover_pct,
    condition: conditionFor(temperature_c, precipitation_mm, wind_speed_kmh, cloud_cover_pct),
  }
})

export const weatherByMatchId = new Map(weather.map((w) => [w.match_id, w]))

// export const teamWeatherScores: TeamWeatherScore[] = (() => {
//   type Row = { teamId: number; condition: WeatherCondition; points: number }
//   const rows: Row[] = []

//   for (const match of matches) {
//     const matchWeather = weatherByMatchId.get(match.id)
//     if (!matchWeather) continue

//     const homePoints = match.home_goals > match.away_goals ? 3 : match.home_goals === match.away_goals ? 1 : 0
//     const awayPoints = match.away_goals > match.home_goals ? 3 : match.away_goals === match.home_goals ? 1 : 0

//     rows.push({ teamId: match.home_team_id, condition: matchWeather.condition, points: homePoints })
//     rows.push({ teamId: match.away_team_id, condition: matchWeather.condition, points: awayPoints })
//   }

//   const teamIds = new Set(rows.map((r) => r.teamId))
//   const scores: TeamWeatherScore[] = []

//   for (const teamId of teamIds) {
//     const teamRows = rows.filter((r) => r.teamId === teamId)
//     const overallAvg = teamRows.reduce((sum, r) => sum + r.points, 0) / teamRows.length

//     const conditions = new Set(teamRows.map((r) => r.condition))
//     for (const condition of conditions) {
//       const conditionRows = teamRows.filter((r) => r.condition === condition)
//       const avgPointsPerMatch = conditionRows.reduce((sum, r) => sum + r.points, 0) / conditionRows.length

//       scores.push({
//         team_id: teamId,
//         condition,
//         sample_size: conditionRows.length,
//         avg_points_per_match: Number(avgPointsPerMatch.toFixed(2)),
//         weather_score: Number(clamp((avgPointsPerMatch - overallAvg) / 1.5, -1, 1).toFixed(2)),
//       })
//     }
//   }

//   return scores
// })()
