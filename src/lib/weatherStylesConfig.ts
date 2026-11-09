import type { Weather, WeatherFactor } from "@/data/types";
import {
  isFrost,
  profileFor,
  type WeatherAxisKey,
  type WeatherConditionKey,
} from "./weatherProfile";
import {
  Sun,
  Cloudy,
  CloudRain,
  CloudSnow,
  Wind,
  ThermometerSun,
  ThermometerSnowflake,
  Thermometer,
  CloudDrizzle,
  CloudHail,
  Leaf,
  Tornado,
  type LucideIcon,
  CloudRainWind,
} from "lucide-react";

export type WeatherDisplay =
  | "sleet"
  | "snow"
  | "rain"
  | "drizzle"
  | "heat"
  | "cold"
  | "wind"
  | "clouds"
  | "clear";

export const weatherDisplay: Record<
  WeatherDisplay,
  {
    icon: LucideIcon;
    label: string;
    bg: string;
    text: string;
    chartColor: string;
  }
> = {
  sleet: {
    icon: CloudHail,
    label: "Deszcz ze śniegiem",
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-600 dark:text-sky-300",
    chartColor: "var(--weather-snow)",
  },
  snow: {
    icon: CloudSnow,
    label: "Śnieg",
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-500 dark:text-sky-400",
    chartColor: "var(--weather-snow)",
  },
  rain: {
    icon: CloudRain,
    label: "Deszcz",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-500 dark:text-blue-400",
    chartColor: "var(--weather-rain)",
  },
  drizzle: {
    icon: CloudDrizzle,
    label: "Słabe opady",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-400 dark:text-blue-300",
    chartColor: "var(--weather-rain)",
  },
  heat: {
    icon: ThermometerSun,
    label: "Upał",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-500 dark:text-red-400",
    chartColor: "var(--weather-extreme-heat)",
  },
  cold: {
    icon: ThermometerSnowflake,
    label: "Mróz",
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-500 dark:text-indigo-400",
    chartColor: "var(--weather-extreme-cold)",
  },
  wind: {
    icon: Wind,
    label: "Silny wiatr",
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-500 dark:text-teal-400",
    chartColor: "var(--weather-wind)",
  },
  clouds: {
    icon: Cloudy,
    label: "Pochmurno",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-500 dark:text-slate-400",
    chartColor: "var(--weather-clouds)",
  },
  clear: {
    icon: Sun,
    label: "Bezchmurnie",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-500 dark:text-amber-400",
    chartColor: "var(--weather-clear)",
  },
};

export type WeatherConditionKind = "normal" | "difficult";

export const weatherConditionStyles: Record<
  WeatherConditionKind,
  { label: string; color: string }
> = {
  normal: { label: "Normalna", color: "var(--weather-normal)" },
  difficult: { label: "Trudna", color: "var(--weather-difficult)" },
};

const CLOUDY_PCT = 60;
// tylko do wyboru ikony "upał" - kategoria "wysoka temperatura" zaczyna się dużo niżej
const HEAT_DISPLAY_C = 28;

export function weatherDisplayFor(weather: Weather): WeatherDisplay {
  const { precip, precipType, wind } = profileFor(weather);

  if (precipType === "sleet") return "sleet";
  if (precipType === "snow") return "snow";
  if (precipType === "rain") return precip === "heavy" ? "rain" : "drizzle";

  if (weather.temperature_c >= HEAT_DISPLAY_C) return "heat";
  if (isFrost(weather.temperature_c)) return "cold";
  if (wind === "strong") return "wind";

  return weather.cloud_cover_pct > CLOUDY_PCT ? "clouds" : "clear";
}

export const weatherFactorIcons: Record<WeatherFactor, LucideIcon> = {
  precipitation: CloudRain,
  temperature: Thermometer,
  wind: Wind,
};

export function weatherScoreColor(score: number): string {
  if (score >= 55) return "text-green-600 dark:text-green-500/90";
  if (score >= 45) return "text-muted-foreground";
  return "text-destructive";
}

// ikony pasm per oś - nazwy kategorii się powtarzają (np. "light" przy opadach i wietrze)
export const bandIcons: Record<WeatherAxisKey, Record<string, LucideIcon>> = {
  temp: { low: ThermometerSnowflake, normal: Thermometer, high: ThermometerSun },
  precip: { none: Sun, light: CloudDrizzle, heavy: CloudRainWind },
  precipType: { rain: CloudRain, snow: CloudSnow, sleet: CloudHail },
  wind: { calm: Leaf, light: Wind, strong: Tornado },
};

export const conditionIcons: Record<WeatherConditionKey, LucideIcon> = {
  heavyPrecip: bandIcons.precip.heavy,
  strongWind: bandIcons.wind.strong,
  lowTemp: bandIcons.temp.low,
  highTemp: bandIcons.temp.high,
  snow: bandIcons.precipType.snow,
};
