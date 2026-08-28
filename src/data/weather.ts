// Dane zamockowane — do podmiany na endpointy backendu.
// Kontrakt wymyślony: backend nie ma danych pogodowych. Wartości generowane
// z dat meczów z matches.ts.
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

// Miesięczne przedziały temperatur dla Europy Środkowej. Mecze idą od sierpnia
// do maja, ale czerwiec i lipiec są zdefiniowane, żeby szerszy kalendarz nie
// wpadał w wartość domyślną.
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

// Deszcz i wiatr sezonowo. conditionFor() sprawdza snow/rain/wind przed
// extreme_heat, więc stała szansa opadów przez cały rok przykrywała upały.
const monthRainChance: Record<number, number> = {
  1: 0.45, 2: 0.45, 3: 0.45, 4: 0.4, 5: 0.3, 6: 0.2,
  7: 0.15, 8: 0.15, 9: 0.3, 10: 0.45, 11: 0.5, 12: 0.5,
}

const monthWindMax: Record<number, number> = {
  1: 50, 2: 50, 3: 48, 4: 36, 5: 34, 6: 30,
  7: 30, 8: 30, 9: 34, 10: 46, 11: 50, 12: 50,
}

// Przesunięcie przedziału o klimat kraju gospodarza. Bez tego `extreme_heat`
// (>=28C) i `extreme_cold` (<=-3C) prawie nie występowały.
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
  if (temperature >= 28) return "extreme_heat"
  if (wind > 35) return "wind"
  if (cloudCover > 60) return "clouds"
  return "clear"
}

export const weather: Weather[] = matches.map((match) => {
  const month = Number(match.datetime.slice(5, 7))
  const [minTemp, maxTemp] = monthTempRange[month] ?? [5, 20]
  // mecze gra się na stadionie gospodarza, więc jego kraj wyznacza klimat
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
