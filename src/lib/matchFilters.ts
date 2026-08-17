import type { WeatherCondition } from "@/data/types"
import type { MatchWithWeather } from "@/services/matchesService"

export type MatchFilters = {
  query: string
  condition: WeatherCondition | "all"
  season: string | "all"
  leagueId: number | "all"
  dateFrom: string
  dateTo: string
}

export const emptyFilters: MatchFilters = {
  query: "",
  condition: "all",
  season: "all",
  leagueId: "all",
  dateFrom: "",
  dateTo: "",
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

export function filterMatches(
  matches: MatchWithWeather[],
  filters: MatchFilters
): MatchWithWeather[] {
  // normalized once for the whole pass, not per match
  const needle = normalize(filters.query.trim())

  return matches.filter((match) => {
    if (filters.condition !== "all" && match.weather?.condition !== filters.condition) return false;
    if (filters.season !== "all" && match.season !== filters.season) return false;
    if (filters.leagueId !== "all" && match.league_id !== filters.leagueId) return false;

    // ISO dates compare lexicographically, so no Date parsing is needed
    const day = match.datetime.slice(0, 10)
    if (filters.dateFrom !== "" && day < filters.dateFrom) return false;
    if (filters.dateTo !== "" && day > filters.dateTo) return false;

    if (needle !== "" && !teamHaystack(match).includes(needle)) return false;

    return true;
  })
}

// Team name, abbreviation and city, for both sides of the fixture.
function teamHaystack(match: MatchWithWeather): string {
  const { homeTeam, awayTeam } = match
  return normalize(
    [
      homeTeam.name,
      homeTeam.short_name,
      homeTeam.city,
      awayTeam.name,
      awayTeam.short_name,
      awayTeam.city,
    ].join(" ")
  )
}

/**
 * Weather conditions that actually occur in this set of matches.
 *
 * A team only ever plays in its own country, so a filter listing all seven
 * conditions would offer Legia an "upał" pill that can only ever return zero
 * matches. Callers decide the display order (weatherConfig owns it) — this
 * just answers "which ones exist here".
 */
export function getConditions(matches: MatchWithWeather[]): WeatherCondition[] {
  const conditions = new Set<WeatherCondition>()
  for (const match of matches) {
    if (match.weather !== null) conditions.add(match.weather.condition)
  }
  return [...conditions]
}

// Season options for the dropdown, newest first. Derived from the matches at
// hand — the value sits on every row already, so there is nothing to fetch.
export function getSeasons(matches: MatchWithWeather[]): string[] {
  const seasons = new Set<string>()
  for (const match of matches) {
    if (match.season !== null) seasons.add(match.season)
  }
  return [...seasons].sort().reverse()
}

/** Drives the "reset" button — hidden while nothing is narrowed down. */
export function hasActiveFilters(filters: MatchFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.condition !== "all" ||
    filters.season !== "all" ||
    filters.leagueId !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  )
}