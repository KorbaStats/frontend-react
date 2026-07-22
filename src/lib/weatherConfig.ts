import type { WeatherCondition } from "@/data/types";
import {
  Sun,
  Cloudy,
  CloudRain,
  CloudSnow,
  Wind,
  ThermometerSun,
  ThermometerSnowflake,
} from "lucide-react";

export const weatherConfig: Record<WeatherCondition, {
  icon: typeof Sun;
  label: string;
  bg: string;
  text: string;
}> = {
  clear: { icon: Sun, label: "Bezchmurnie", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-500 dark:text-amber-400" },
  clouds: { icon: Cloudy, label: "Pochmurno", bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-500 dark:text-slate-400" },
  rain: { icon: CloudRain, label: "Deszcz", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-500 dark:text-blue-400" },
  snow: { icon: CloudSnow, label: "Śnieg", bg: "bg-sky-100 dark:bg-sky-900/40", text: "text-sky-500 dark:text-sky-400" },
  wind: { icon: Wind, label: "Wietrznie", bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-500 dark:text-teal-400" },
  extreme_heat: { icon: ThermometerSun, label: "Upał", bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-500 dark:text-red-400" },
  extreme_cold: { icon: ThermometerSnowflake, label: "Mróz", bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-500 dark:text-indigo-400" },
};