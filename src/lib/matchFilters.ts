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
  // normalizowane raz na cały przebieg, nie osobno dla każdego meczu
  const needle = normalize(filters.query.trim())

  return matches.filter((match) => {
    if (filters.condition !== "all" && match.weather?.condition !== filters.condition) return false;
    if (filters.season !== "all" && match.season !== filters.season) return false;
    if (filters.leagueId !== "all" && match.league_id !== filters.leagueId) return false;

    // daty ISO porównują się leksykograficznie, więc parsowanie Date jest zbędne
    const day = match.datetime.slice(0, 10)
    if (filters.dateFrom !== "" && day < filters.dateFrom) return false;
    if (filters.dateTo !== "" && day > filters.dateTo) return false;

    if (needle !== "" && !teamHaystack(match).includes(needle)) return false;

    return true;
  })
}

// Nazwa drużyny, skrót i miasto — dla obu stron spotkania.
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
 * Warunki pogodowe występujące w tym zbiorze meczów.
 *
 * Drużyna gra tylko we własnym kraju, więc pełna lista siedmiu warunków dawałaby
 * filtry zwracające zero meczów. Kolejność wyświetlania ustala weatherConfig.
 */
export function getConditions(matches: MatchWithWeather[]): WeatherCondition[] {
  const conditions = new Set<WeatherCondition>()
  for (const match of matches) {
    if (match.weather !== null) conditions.add(match.weather.condition)
  }
  return [...conditions]
}

// Sezony do dropdowna, od najnowszych. Wartość jest już w każdym meczu.
export function getSeasons(matches: MatchWithWeather[]): string[] {
  const seasons = new Set<string>()
  for (const match of matches) {
    if (match.season !== null) seasons.add(match.season)
  }
  return [...seasons].sort().reverse()
}

/** Widoczność przycisku "reset". */
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