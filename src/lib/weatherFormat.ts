import type { Weather } from "@/data/types";

export type WeatherMetric = Exclude<keyof Weather, "match_id">;

const metricFormat: Record<WeatherMetric, { decimals: number; unit: string }> = {
  temperature_c: { decimals: 1, unit: "°C" },
  feels_like_c: { decimals: 1, unit: "°C" },
  precipitation_mm: { decimals: 1, unit: " mm" },
  rain_mm: { decimals: 1, unit: " mm" },
  snowfall_cm: { decimals: 1, unit: " cm" },
  wind_speed_kmh: { decimals: 0, unit: " km/h" },
  humidity_pct: { decimals: 0, unit: "%" },
  cloud_cover_pct: { decimals: 0, unit: "%" },
};

export function formatWeatherValue(
  metric: WeatherMetric,
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";

  const { decimals, unit } = metricFormat[metric];
  return `${value.toFixed(decimals)}${unit}`;
}
