import type { Weather, WeatherCondition } from "@/data/types";
import { profileFor } from "./weatherProfile";
import {
  Sun,
  Cloudy,
  CloudRain,
  CloudSnow,
  Wind,
  ThermometerSun,
  ThermometerSnowflake,
  Thermometer,
  Snowflake,
  Flame,
  CloudDrizzle,
  CloudHail,
  Leaf,
  Tornado,
  type LucideIcon,
} from "lucide-react";

// `chartColor` to token CSS, nie klasa Tailwinda — recharts ustawia fill/stroke
// bezpośrednio na SVG. Wartości w globals.css, z wariantem dla dark mode.
export const weatherConfig: Record<
  WeatherCondition,
  {
    icon: typeof Sun;
    label: string;
    bg: string;
    text: string;
    chartColor: string;
  }
> = {
  clear: {
    icon: Sun,
    label: "Bezchmurnie",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-500 dark:text-amber-400",
    chartColor: "var(--weather-clear)",
  },
  clouds: {
    icon: Cloudy,
    label: "Pochmurno",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-500 dark:text-slate-400",
    chartColor: "var(--weather-clouds)",
  },
  rain: {
    icon: CloudRain,
    label: "Deszcz",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-500 dark:text-blue-400",
    chartColor: "var(--weather-rain)",
  },
  snow: {
    icon: CloudSnow,
    label: "Śnieg",
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-500 dark:text-sky-400",
    chartColor: "var(--weather-snow)",
  },
  wind: {
    icon: Wind,
    label: "Wietrznie",
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-500 dark:text-teal-400",
    chartColor: "var(--weather-wind)",
  },
  extreme_heat: {
    icon: ThermometerSun,
    label: "Upał",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-500 dark:text-red-400",
    chartColor: "var(--weather-extreme-heat)",
  },
  extreme_cold: {
    icon: ThermometerSnowflake,
    label: "Mróz",
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-500 dark:text-indigo-400",
    chartColor: "var(--weather-extreme-cold)",
  },
};

// ---------------------------------------------------------------------------
// Prezentacja pogody wyliczana z PASM — tych samych, na których stoją filtry
// i weather score. Dzięki temu ikonka nie może już powiedzieć czegoś innego
// niż zaznaczony filtr.
//
// Stary `weatherConfig` powyżej jest keyowany po `condition` i zostaje tylko
// dla SummaryCards.
//TODO: usunąć weatherConfig i `condition`, gdy SummaryCards przejdzie na pasma
// ---------------------------------------------------------------------------

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

const CLOUDY_PCT = 60;

/**
 * Najbardziej zauważalna cecha pogody meczu. Kolejność jest decyzją projektową:
 * opady przed temperaturą, bo stan murawy widać mocniej niż stopnie, a temperatura i tak jest obok ikony i opisu warunków. Niebo jest ostatnie - chmury nie zwiekszaja/zmniejszają produktywnosci czy tempa meczu.
 */
export function weatherDisplayFor(weather: Weather): WeatherDisplay {
  const { temp, precip, precipType, wind } = profileFor(weather);

  if (precipType === "sleet") return "sleet";
  if (precipType === "snow") return "snow";
  if (precipType === "rain") return precip === "heavy" ? "rain" : "drizzle";

  if (temp === "hot") return "heat";
  if (temp === "freezing") return "cold";
  if (wind === "strong") return "wind";

  return weather.cloud_cover_pct > CLOUDY_PCT ? "clouds" : "clear";
}

// kolor weather score — progi jak w weatherScoreLabel
export function weatherScoreColor(score: number): string {
  if (score >= 55) return "text-green-600 dark:text-green-500/90";
  if (score >= 45) return "text-muted-foreground";
  return "text-destructive";
}

// ikony do pigulek filtrow
export const bandIcons: Record<string, LucideIcon> = {
  // temperatura
  freezing: ThermometerSnowflake,
  cold: Snowflake,
  mild: Thermometer,
  warm: ThermometerSun,
  hot: Flame,
  // opady
  dry: Sun,
  light: CloudDrizzle,
  heavy: CloudRain,
  // rodzaj opadow
  rain: CloudRain,
  snow: CloudSnow,
  sleet: CloudHail,
  // wiatr
  calm: Leaf,
  breezy: Wind,
  strong: Tornado,
};
