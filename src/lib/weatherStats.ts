import type { MatchWithWeather } from "@/services/matchesService";

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
