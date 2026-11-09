import type { Weather, WeatherFactor, WeatherScoreCategory } from "@/data/types"

// Kategorie pogody są zdefiniowane w jednym miejscu - na backendzie (backend/src/helpers/weatherCategories.js),
// te same służą do weather score, filtrów i analiz. API klasyfikuje każdy mecz (weather.conditions),
// a frontend tylko z tego korzysta. Zakresy liczbowe kategorii: GET /api/weather-scores/categories.

export type TempBand = WeatherScoreCategory["temperature"]
export type PrecipBand = WeatherScoreCategory["precipitation"]
export type WindBand = WeatherScoreCategory["wind"]
export type PrecipTypeBand = "rain" | "snow" | "sleet"

// null = brak danej wartości pogodowej
export type WeatherProfile = {
  temp: TempBand | null
  precip: PrecipBand | null
  wind: WindBand | null
  precipType: PrecipTypeBand | null
}

export function profileFor(weather: Weather): WeatherProfile {
  const { conditions } = weather
  return {
    temp: conditions.temperature,
    precip: conditions.precipitation,
    wind: conditions.wind,
    precipType: conditions.precipitation_type,
  }
}

// mróz w sensie fizycznym (poniżej zera) - tylko do opisów i rekordów, nie jest kategorią analiz
export const FROST_TEMPERATURE_C = 0
export const isFrost = (temperature_c: number) => temperature_c <= FROST_TEMPERATURE_C

export type WeatherAxisKey = "temp" | "precip" | "precipType" | "wind"

// factor - odpowiadający czynnik backendu (do zakresów liczbowych z /api/weather-scores/categories)
export const weatherAxes = [
  {
    key: "temp" as const,
    factor: "temperature" as WeatherFactor | null,
    label: "Temperatura",
    bands: [
      { value: "low" as const, label: "Niska" },
      { value: "normal" as const, label: "Normalna" },
      { value: "high" as const, label: "Wysoka" },
    ],
  },
  {
    key: "precip" as const,
    factor: "precipitation" as WeatherFactor | null,
    label: "Opady",
    bands: [
      { value: "none" as const, label: "Brak" },
      { value: "light" as const, label: "Mały deszcz" },
      { value: "heavy" as const, label: "Duży deszcz" },
    ],
  },
  {
    key: "precipType" as const,
    factor: null as WeatherFactor | null,
    label: "Rodzaj opadów",
    bands: [
      { value: "rain" as const, label: "Deszcz" },
      { value: "snow" as const, label: "Śnieg" },
      { value: "sleet" as const, label: "Deszcz ze śniegiem" },
    ],
  },
  {
    key: "wind" as const,
    factor: "wind" as WeatherFactor | null,
    label: "Wiatr",
    bands: [
      { value: "calm" as const, label: "Brak" },
      { value: "light" as const, label: "Lekki" },
      { value: "strong" as const, label: "Silny" },
    ],
  },
]

export type WeatherConditionKey = "heavyPrecip" | "strongWind" | "lowTemp" | "highTemp" | "snow"

export type WeatherCondition = {
  key: WeatherConditionKey
  label: string
  isMet: (profile: WeatherProfile) => boolean
}

// Trudna pogoda - te same warunki co DIFFICULT_CONDITIONS na backendzie
export const difficultConditions: WeatherCondition[] = [
  { key: "heavyPrecip", label: "Duży deszcz", isMet: (p) => p.precip === "heavy" },
  { key: "strongWind", label: "Silny wiatr", isMet: (p) => p.wind === "strong" },
]

// warunki do porównań ze zwykłą pogodą (WeatherComparisonChart) - trudne oraz pozostałe skrajne kategorie
export const comparisonConditions: WeatherCondition[] = [
  ...difficultConditions,
  { key: "lowTemp", label: "Niska temperatura", isMet: (p) => p.temp === "low" },
  { key: "highTemp", label: "Wysoka temperatura", isMet: (p) => p.temp === "high" },
  { key: "snow", label: "Śnieg", isMet: (p) => p.precipType === "snow" || p.precipType === "sleet" },
]

export const difficultConditionsText = difficultConditions
  .map((condition) => condition.label.toLowerCase())
  .join(" lub ")

export function isDifficultWeather(weather: Weather): boolean {
  return weather.conditions.difficult === true
}
