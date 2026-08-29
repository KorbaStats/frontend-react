import type { Weather } from "@/data/types"

export type TempBand = "freezing" | "cold" | "mild" | "warm" | "hot"
export type PrecipBand = "dry" | "light" | "heavy" | "snow"
export type WindBand = "calm" | "breezy" | "strong"

export type WeatherProfile = {
  temp: TempBand
  precip: PrecipBand
  wind: WindBand
  severity: number
}

// progi eksperckie, nie wyliczone z danych
export const weatherThresholds = {
  // górna granica pasma, ostatnie to reszta
  temp: { freezing: 0, cold: 8, mild: 18, warm: 26 },
  precip: { dry: 0.2, light: 2.5 },
  wind: { calm: 15, breezy: 30 },
  snowTemp: 0,
} as const

export const severityParams = {
  idealTemp: 15,
  tempRange: 20, // odchylenie o tyle stopni od idealnej = maksymalna kara
  precipMax: 8, // mm, powyżej kara maksymalna
  windFree: 10, // km/h bez kary
  windRange: 40, // km/h ponad windFree do kary maksymalnej
  weights: { temp: 0.4, precip: 0.35, wind: 0.25 },
} as const

export function tempBandFor(temperature_c: number): TempBand {
  const t = weatherThresholds.temp
  if (temperature_c <= t.freezing) return "freezing"
  if (temperature_c <= t.cold) return "cold"
  if (temperature_c <= t.mild) return "mild"
  if (temperature_c <= t.warm) return "warm"
  return "hot"
}

export function precipBandFor(precipitation_mm: number, temperature_c: number): PrecipBand {
  const p = weatherThresholds.precip
  if (precipitation_mm < p.dry) return "dry"
  if (temperature_c <= weatherThresholds.snowTemp) return "snow"
  if (precipitation_mm < p.light) return "light"
  return "heavy"
}

export function windBandFor(wind_speed_kmh: number): WindBand {
  const w = weatherThresholds.wind
  if (wind_speed_kmh < w.calm) return "calm"
  if (wind_speed_kmh < w.breezy) return "breezy"
  return "strong"
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

export function severityFor(weather: Weather): number {
  const p = severityParams

  const tempPenalty = clamp01(Math.abs(weather.temperature_c - p.idealTemp) / p.tempRange)
  const precipPenalty = clamp01(weather.precipitation_mm / p.precipMax)
  const windPenalty = clamp01(Math.max(weather.wind_speed_kmh - p.windFree, 0) / p.windRange)

  return clamp01(
    p.weights.temp * tempPenalty +
      p.weights.precip * precipPenalty +
      p.weights.wind * windPenalty,
  )
}

export function profileFor(weather: Weather): WeatherProfile {
  return {
    temp: tempBandFor(weather.temperature_c),
    precip: precipBandFor(weather.precipitation_mm, weather.temperature_c),
    wind: windBandFor(weather.wind_speed_kmh),
    severity: severityFor(weather),
  }
}

export type WeatherAxisKey = "temp" | "precip" | "wind"

//kolejność wyświetlania
export const weatherAxes = [
  {
    key: "temp" as const,
    label: "Temperatura (°C)",
    bands: [
      { value: "freezing" as const, label: "≤ 0" },
      { value: "cold" as const, label: "0 – 8" },
      { value: "mild" as const, label: "8 – 18" },
      { value: "warm" as const, label: "18 – 26" },
      { value: "hot" as const, label: "> 26" },
    ],
  },
  {
    key: "precip" as const,
    label: "Opady",
    bands: [
      { value: "dry" as const, label: "Brak" },
      { value: "light" as const, label: "Mżawka" },
      { value: "heavy" as const, label: "Ulewa" },
      { value: "snow" as const, label: "Śnieg" },
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

export function bandLabel(axis: WeatherAxisKey, band: string): string {
  const found = weatherAxes.find((a) => a.key === axis)?.bands.find((b) => b.value === band)
  return found?.label ?? band
}
