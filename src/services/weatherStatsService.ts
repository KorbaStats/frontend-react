// Agregaty pogodowe. Backend nie ma danych pogodowych (brak tabeli, kolumny
// i route'a — sprawdzone 2026-08-05), więc poniższe endpointy to propozycja
// kształtu przyszłego API. Każda funkcja potrzebuje pełnego zbioru meczów,
// dlatego są w services/, a nie w lib/.
//
// Proponowane endpointy:
//   GET /api/weather-stats/extremes           -> WeatherExtremes
//   GET /api/weather-stats/difficult-share    -> DifficultWeatherShare
//   GET /api/weather-stats/percentiles        -> WeatherPercentile[]
//   GET /api/teams/:id/weather-score?season=  -> WeatherScore | null
//TODO: verify against real API response once the backend has weather

import { getMatches, getTeamMatches } from "@/services/matchesService";
import type { Weather } from "@/data/types";
import {
  type WeatherScore,
  computeWeatherScore,
  isDifficultWeather,
} from "@/lib/weatherScore";

export type ExtremeMatch = {
  city: string | undefined;
  weather: Weather;
};

export type WeatherExtremes = {
  coldest: ExtremeMatch | null;
  windiest: ExtremeMatch | null;
};

/**
 * GET /api/weather-stats/extremes
 *
 * Skrajne mecze w całym zbiorze. Pojedyncze mecze, nie średnie — dlatego wolno
 * je liczyć ze wszystkich lig naraz.
 */
export async function getWeatherExtremes(): Promise<WeatherExtremes> {
  const { data } = await getMatches();

  const withWeather = data
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
  /** Mianownik to mecze Z pogodą — bez niej nie ma czego klasyfikować. */
  withWeather: number;
};

/**
 * GET /api/weather-stats/difficult-share
 *
 * Ile meczów wpada w trudne warunki wg tego samego predykatu, na którym stoi
 * weather score. Zliczanie, nie uśrednianie, więc ligi mogą iść razem.
 */
export async function getDifficultWeatherShare(): Promise<DifficultWeatherShare> {
  const { data } = await getMatches();
  const withWeather = data.filter((match) => match.weather !== null);

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
  /** Wartość z tego meczu. */
  value: number;
  /** 0-100, gdzie 50 to mediana rozkładu. */
  percentile: number;
  /** % meczów ze ŚCIŚLE mniejszą / większą wartością — do opisu słownego. */
  below: number;
  above: number;
  /** Mediana metryki w lidze. */
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

// Remisy liczone w połowie, żeby powtarzalne wartości (np. 0 mm opadów) nie
// zawyżały percentyla.
function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;

  const below = values.filter((v) => v < value).length;
  const equal = values.filter((v) => v === value).length;

  return ((below + equal / 2) / values.length) * 100;
}

// Mediana - odpowiada normie w danej lidze
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * GET /api/weather-stats/percentiles?match_id=X&league_id=Y
 *
 * Pozycja warunków tego meczu w rozkładzie wszystkich meczów ligi.
 */
export async function getWeatherPercentiles(
  matchId: number,
  leagueId?: number,
): Promise<WeatherPercentile[]> {
  const { data } = await getMatches();

  const match = data.find((m) => m.id === matchId);
  if (!match?.weather) return [];

  const population = data.filter(
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

/** GET /api/teams/:id/weather-score?season=2025/2026 */
export async function getTeamWeatherScore(
  teamId: number,
  season?: string | null,
): Promise<WeatherScore | null> {
  const teamMatches = await getTeamMatches(teamId);
  const scoped = season
    ? teamMatches.filter((match) => match.season === season)
    : teamMatches;

  return computeWeatherScore(scoped, teamId);
}