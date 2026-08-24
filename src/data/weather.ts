// Dane zamockowane — do podmiany na endpointy backendu.
// Kontrakt wymyślony: backend nie ma jeszcze żadnych danych pogodowych. Każde
// pole tutaj to zgadywanka, co taki endpoint mógłby zwracać, skorelowana z
// datami meczów z matches.ts, żeby funkcja "weather score" (patrz CLAUDE.md)
// miała co nanosić na wykresy.
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

// Zgrubne miesięczne przedziały temperatur, skalibrowane dla Europy Środkowej.
// Zamockowane mecze idą od sierpnia do maja (patrz definicje sezonów w
// matches.ts); czerwiec i lipiec są zdefiniowane mimo to, żeby szerszy kalendarz
// nie wpadał po cichu w wartość domyślną.
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

// Deszcz i wiatr też są sezonowe. To nie jest kosmetyka: conditionFor()
// sprawdza snow/rain/wind *przed* extreme_heat, więc jednakowa szansa na ulewę
// przez cały rok powodowała, że gorące mecze w Hiszpanii wciąż lądowały jako
// `rain`.
const monthRainChance: Record<number, number> = {
  1: 0.45, 2: 0.45, 3: 0.45, 4: 0.4, 5: 0.3, 6: 0.2,
  7: 0.15, 8: 0.15, 9: 0.3, 10: 0.45, 11: 0.5, 12: 0.5,
}

const monthWindMax: Record<number, number> = {
  1: 50, 2: 50, 3: 48, 4: 36, 5: 34, 6: 30,
  7: 30, 8: 30, 9: 34, 10: 46, 11: 50, 12: 50,
}

// Przesuwa przedział o klimat kraju gospodarza, żeby ten sam sierpniowy mecz
// był upałem w Sewilli i łagodnym wieczorem w Newcastle. Bez tego oba skrajne
// warunki prawie się nie pojawiały: `extreme_heat` wymaga >=28C, a
// `extreme_cold` <=-3C (patrz conditionFor niżej).
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
