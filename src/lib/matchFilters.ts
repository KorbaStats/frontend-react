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
 * Warunki pogodowe, które faktycznie występują w tym zbiorze meczów.
 *
 * Drużyna gra tylko we własnym kraju, więc filtr wypisujący wszystkie siedem
 * warunków dawałby Legii pigułkę "upał", która zawsze zwróci zero meczów.
 * O kolejności wyświetlania decydują wywołujący (należy do weatherConfig) — to
 * odpowiada wyłącznie na pytanie "które tu w ogóle istnieją".
 */
export function getConditions(matches: MatchWithWeather[]): WeatherCondition[] {
  const conditions = new Set<WeatherCondition>()
  for (const match of matches) {
    if (match.weather !== null) conditions.add(match.weather.condition)
  }
  return [...conditions]
}

// Opcje sezonów do dropdowna, od najnowszych. Wyprowadzone z meczów, które
// mamy pod ręką — wartość siedzi już w każdym wierszu, więc nie ma czego pobierać.
export function getSeasons(matches: MatchWithWeather[]): string[] {
  const seasons = new Set<string>()
  for (const match of matches) {
    if (match.season !== null) seasons.add(match.season)
  }
  return [...seasons].sort().reverse()
}

/** Steruje przyciskiem "reset" — ukrytym, dopóki nic nie jest zawężone. */
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