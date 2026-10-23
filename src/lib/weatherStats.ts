import type { Weather } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { isDifficultWeather } from "./weatherProfile";

export type ExtremeMatch = {
  city: string | undefined;
  weather: Weather;
};

export type WeatherExtremes = {
  coldest: ExtremeMatch | null;
  windiest: ExtremeMatch | null;
};

export function computeWeatherExtremes(
  matches: MatchWithWeather[],
): WeatherExtremes {
  const withWeather = matches
    .filter((match) => match.weather !== null)
    .map((match) => ({
      city: match.stadium?.city,
      weather: match.weather!,
    }));

  if (withWeather.length === 0) return { coldest: null, windiest: null };

  return {
    coldest: withWeather.reduce((lowest, match) =>
      match.weather.temperature_c < lowest.weather.temperature_c
        ? match
        : lowest,
    ),
    windiest: withWeather.reduce((strongest, match) =>
      match.weather.wind_speed_kmh > strongest.weather.wind_speed_kmh
        ? match
        : strongest,
    ),
  };
}

export type DifficultWeatherShare = {
  difficult: number;
  withWeather: number;
};

export function computeDifficultWeatherShare(
  matches: MatchWithWeather[],
): DifficultWeatherShare {
  const withWeather = matches.filter((match) => match.weather !== null);

  return {
    difficult: withWeather.filter((match) => isDifficultWeather(match.weather!))
      .length,
    withWeather: withWeather.length,
  };
}

export type WeatherMetricKey =
  | "temperature_c"
  | "wind_speed_kmh"
  | "precipitation_mm"
  | "humidity_pct";

export type WeatherPercentile = {
  metric: WeatherMetricKey;
  value: number;
  percentile: number;
  below: number;
  above: number;
  median: number;
  min: number;
  max: number;
  matchCount: number;
};

const percentileMetrics: WeatherMetricKey[] = [
  "temperature_c",
  "wind_speed_kmh",
  "precipitation_mm",
  "humidity_pct",
];

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;

  const below = values.filter((v) => v < value).length;
  const equal = values.filter((v) => v === value).length;

  return ((below + equal / 2) / values.length) * 100;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function computeWeatherPercentiles(
  matches: MatchWithWeather[],
  matchId: number,
  leagueId?: number,
): WeatherPercentile[] {
  const match = matches.find((m) => m.id === matchId);
  if (!match?.weather) return [];

  const population = matches.filter(
    (m) =>
      m.weather !== null &&
      (leagueId === undefined || m.league_id === leagueId),
  );

  return percentileMetrics.map((metric) => {
    const values = population.map((m) => m.weather![metric]);
    const value = match.weather![metric];

    return {
      metric,
      value,
      percentile: percentileRank(values, value),
      below: (values.filter((v) => v < value).length / values.length) * 100,
      above: (values.filter((v) => v > value).length / values.length) * 100,
      median: median(values),
      min: Math.min(...values),
      max: Math.max(...values),
      matchCount: values.length,
    };
  });
}
