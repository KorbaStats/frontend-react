import type { MatchWithWeather } from "@/services/matchesService";

const MATCH_WINDOW_MS = 2 * 60 * 60 * 1000;

export function isAwaitingWeather(match: MatchWithWeather, now: number): boolean {
  return match.weather === null && new Date(match.datetime).getTime() <= now - MATCH_WINDOW_MS;
}

export type WeatherCoverageRow = {
  key: string;
  league: string;
  season: string;
  matches: number;
  withWeather: number;
};

export function computeWeatherCoverage(matches: MatchWithWeather[]): WeatherCoverageRow[] {
  const rows = new Map<string, WeatherCoverageRow>();

  for (const match of matches) {
    const league = match.league?.name ?? "Bez ligi";
    const season = match.season ?? "Bez sezonu";
    const key = `${league}|${season}`;

    const row = rows.get(key) ?? { key, league, season, matches: 0, withWeather: 0 };
    row.matches++;
    if (match.weather !== null) row.withWeather++;
    rows.set(key, row);
  }

  return [...rows.values()].sort(
    (a, b) => a.league.localeCompare(b.league, "pl") || b.season.localeCompare(a.season),
  );
}
