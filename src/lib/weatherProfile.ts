import type { Weather } from "@/data/types"

export type TempBand = "freezing" | "cold" | "mild" | "warm" | "hot"
export type PrecipBand = "dry" | "light" | "heavy"
export type WindBand = "calm" | "breezy" | "strong"
export type PrecipTypeBand = "rain" | "snow" | "sleet"

export type WeatherProfile = {
  temp: TempBand
  precip: PrecipBand
  wind: WindBand
  precipType: PrecipTypeBand | null
}

export const weatherThresholds = {
  temp: { freezing: 0, cold: 8, mild: 18, warm: 28 },
  precip: { dry: 0.2, light: 2.5 },
  wind: { calm: 15, breezy: 30 },
  snowTemp: 0,
} as const

export function tempBandFor(temperature_c: number): TempBand {
  const t = weatherThresholds.temp
  if (temperature_c <= t.freezing) return "freezing"
  if (temperature_c <= t.cold) return "cold"
  if (temperature_c <= t.mild) return "mild"
  if (temperature_c <= t.warm) return "warm"
  return "hot"
}

export function precipBandFor(precipitation_mm: number): PrecipBand {
  const p = weatherThresholds.precip
  if (precipitation_mm < p.dry) return "dry"
  if (precipitation_mm < p.light) return "light"
  return "heavy"
}

export function precipTypeFor(weather: Weather): PrecipTypeBand | null {
  if (weather.precipitation_mm < weatherThresholds.precip.dry) return null

  const hasSnow = weather.snowfall_cm > 0
  const hasRain = weather.rain_mm > 0

  if (hasSnow && hasRain) return "sleet"
  if (hasSnow) return "snow"
  if (hasRain) return "rain"

  return weather.temperature_c <= weatherThresholds.snowTemp ? "snow" : "rain"
}

export function windBandFor(wind_speed_kmh: number): WindBand {
  const w = weatherThresholds.wind
  if (wind_speed_kmh < w.calm) return "calm"
  if (wind_speed_kmh < w.breezy) return "breezy"
  return "strong"
}
// zamniana liczb na pasma pogodowe: freezing, cold, hot itp 
export function profileFor(weather: Weather): WeatherProfile {
  return {
    temp: tempBandFor(weather.temperature_c),
    precip: precipBandFor(weather.precipitation_mm),
    wind: windBandFor(weather.wind_speed_kmh),
    precipType: precipTypeFor(weather),
  }
}

export type WeatherAxisKey = "temp" | "precip" | "precipType" | "wind"

export const weatherAxes = [
  {
    key: "temp" as const,
    label: "Temperatura (°C)",
    bands: [
      { value: "freezing" as const, label: "≤ 0" },
      { value: "cold" as const, label: "0 – 8" },
      { value: "mild" as const, label: "8 – 18" },
      { value: "warm" as const, label: "18 – 28" },
      { value: "hot" as const, label: "> 28" },
    ],
  },
  {
    key: "precip" as const,
    label: "Opady",
    bands: [
      { value: "dry" as const, label: "Brak" },
      { value: "light" as const, label: "Niskie" },
      { value: "heavy" as const, label: "Wysokie" },
    ],
  },
  {
    key: "precipType" as const,
    label: "Rodzaj opadów",
    bands: [
      { value: "rain" as const, label: "Deszcz" },
      { value: "snow" as const, label: "Śnieg" },
      { value: "sleet" as const, label: "Deszcz ze śniegiem" },
    ],
  },
  {
    key: "wind" as const,
    label: "Wiatr",
    bands: [
      { value: "calm" as const, label: "Mały" },
      { value: "breezy" as const, label: "Umiarkowany" },
      { value: "strong" as const, label: "Porywisty" },
    ],
  },
]

export type DifficultConditionKey = "freezing" | "cold" | "hot" | "heavyPrecip" | "snow" | "strongWind"

export type DifficultCondition = {
  key: DifficultConditionKey
  label: string
  isMet: (profile: WeatherProfile) => boolean
}

export const difficultConditions: DifficultCondition[] = [
  { key: "freezing", label: "Mróz", isMet: (p) => p.temp === "freezing" },
  { key: "cold", label: "Zimno", isMet: (p) => p.temp === "cold" },
  { key: "hot", label: "Upał", isMet: (p) => p.temp === "hot" },
  { key: "heavyPrecip", label: "Silne opady", isMet: (p) => p.precip === "heavy" },
  { key: "snow", label: "Śnieg", isMet: (p) => p.precipType === "snow" || p.precipType === "sleet" },
  { key: "strongWind", label: "Silny wiatr", isMet: (p) => p.wind === "strong" },
]

export function isDifficultWeather(weather: Weather): boolean {
  const profile = profileFor(weather)
  return difficultConditions.some((condition) => condition.isMet(profile))
}
