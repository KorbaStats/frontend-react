import type { MatchWithWeather } from "@/services/matchesService"
import {
  profileFor,
  type PrecipBand,
  type TempBand,
  type WindBand,
} from "./weatherProfile"

// OR w obrębie osi, AND między osiami; pusta tablica = bez ograniczenia
export type WeatherBandFilters = {
  temp: TempBand[]
  precip: PrecipBand[]
  wind: WindBand[]
}

export type MatchFilters = WeatherBandFilters & {
  query: string
  season: string | "all"
  leagueId: number | "all"
  dateFrom: string
  dateTo: string
}

export const emptyBandFilters: WeatherBandFilters = {
  temp: [],
  precip: [],
  wind: [],
}

export const emptyFilters: MatchFilters = {
  ...emptyBandFilters,
  query: "",
  season: "all",
  leagueId: "all",
  dateFrom: "",
  dateTo: "",
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

export function hasBandFilters(filters: WeatherBandFilters): boolean {
  return filters.temp.length > 0 || filters.precip.length > 0 || filters.wind.length > 0
}

export function matchesBands(
  match: MatchWithWeather,
  filters: WeatherBandFilters,
): boolean {
  if (!hasBandFilters(filters)) return true
  if (match.weather === null) return false

  const profile = profileFor(match.weather)
  if (filters.temp.length > 0 && !filters.temp.includes(profile.temp)) return false
  if (filters.precip.length > 0 && !filters.precip.includes(profile.precip)) return false
  if (filters.wind.length > 0 && !filters.wind.includes(profile.wind)) return false
  return true
}

export function filterMatches(
  matches: MatchWithWeather[],
  filters: MatchFilters
): MatchWithWeather[] {
  // normalizowane raz na cały przebieg, nie osobno dla każdego meczu
  const needle = normalize(filters.query.trim())

  return matches.filter((match) => {
    if (!matchesBands(match, filters)) return false;
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

/** Widoczność przycisku "reset". */
export function hasActiveFilters(filters: MatchFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    hasBandFilters(filters) ||
    filters.season !== "all" ||
    filters.leagueId !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  )
}
