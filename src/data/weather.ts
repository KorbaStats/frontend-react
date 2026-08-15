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

// Rough monthly temperature bands, calibrated for central Europe. Mocked
// matches run August-May (see matches.ts season definitions); June/July are
// defined anyway so a wider calendar wouldn't silently fall back to a default.
const monthTempRange: Record<number, [number, number]> = {
  1: [-6, 3],
  2: [-5, 5],
  3: [0, 12],
  4: [5, 17],
  5: [10, 23],
  6: [14, 27],
  7: [16, 31],
  8: [16, 31],
  9: [11, 24],
  10: [5, 16],
  11: [0, 10],
  12: [-4, 5],
}

// Rain and wind are seasonal too. They are not cosmetic: conditionFor() checks
// snow/rain/wind *before* extreme_heat, so year-round odds of a downpour meant
// hot Spanish fixtures kept being classified as `rain` instead.
const monthRainChance: Record<number, number> = {
  1: 0.45, 2: 0.45, 3: 0.45, 4: 0.4, 5: 0.3, 6: 0.2,
  7: 0.15, 8: 0.15, 9: 0.3, 10: 0.45, 11: 0.5, 12: 0.5,
}

const monthWindMax: Record<number, number> = {
  1: 50, 2: 50, 3: 48, 4: 36, 5: 34, 6: 30,
  7: 30, 8: 30, 9: 34, 10: 46, 11: 50, 12: 50,
}

// Shifts the band by the host country's climate, so the same August fixture is
// a heatwave in Sevilla and a mild evening in Newcastle. Without this the two
// extreme conditions barely showed up: `extreme_heat` needs >=28C and
// `extreme_cold` <=-3C (see conditionFor below).
const countryTempOffset: Record<string, number> = {
  Spain: 8,
  Germany: 0,
  England: -1,
  Poland: -3,
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
  // matches are played at the home team's stadium, so its country sets the climate
  const offset = countryTempOffset[match.homeTeam.country] ?? 0
  const temperature_c = randFloat(minTemp + offset, maxTemp + offset)
  const precipitation_mm = rng() < (monthRainChance[month] ?? 0.35) ? randFloat(0.5, 12) : 0
  const wind_speed_kmh = randFloat(5, monthWindMax[month] ?? 45)
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
