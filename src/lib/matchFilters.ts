import type { MatchWithWeather } from "@/services/matchesService"
import {
  profileFor,
  type PrecipBand,
  type PrecipTypeBand,
  type TempBand,
  type WindBand,
  type WeatherAxisKey,
  weatherAxes,
} from "./weatherProfile"
import { normalize } from "@/lib/utils.ts";
export type WeatherBandFilters = {
  temp: TempBand[]
  precip: PrecipBand[]
  precipType: PrecipTypeBand[]
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
  precipType: [],
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

export function hasBandFilters(filters: WeatherBandFilters): boolean {
  return (
    filters.temp.length > 0 ||
    filters.precip.length > 0 ||
    filters.precipType.length > 0 ||
    filters.wind.length > 0
  )
}

export function matchesBands(match: MatchWithWeather, filters: WeatherBandFilters): boolean {
  if (!hasBandFilters(filters)) return true
  if (match.weather === null) return false

  const profile = profileFor(match.weather)
  if (filters.temp.length > 0 && !filters.temp.includes(profile.temp)) return false
  if (filters.precip.length > 0 && !filters.precip.includes(profile.precip)) return false
  if (filters.wind.length > 0 && !filters.wind.includes(profile.wind)) return false
  if (
    filters.precipType.length > 0 &&
    (profile.precipType === null ||
      !filters.precipType.includes(profile.precipType))
  )
    return false
  return true
}

export function filterMatches(
  matches: MatchWithWeather[],
  filters: MatchFilters
): MatchWithWeather[] {
  const needle = normalize(filters.query.trim())

  return matches.filter((match) => {
    if (!matchesBands(match, filters)) return false;
    if (filters.season !== "all" && match.season !== filters.season) return false;
    if (filters.leagueId !== "all" && match.league_id !== filters.leagueId) return false;

    const day = match.datetime.slice(0, 10)
    if (filters.dateFrom !== "" && day < filters.dateFrom) return false;
    if (filters.dateTo !== "" && day > filters.dateTo) return false;

    if (needle !== "" && !teamHaystack(match).includes(needle)) return false;

    return true;
  })
}

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

function bandsFromParams<K extends WeatherAxisKey>(
  params: URLSearchParams,
  key: K
): WeatherBandFilters[K] {
  const allowed: string[] =
    weatherAxes.find((axis) => axis.key === key)?.bands.map((band) => band.value) ?? []
  return params.getAll(key).filter((value) => allowed.includes(value)) as WeatherBandFilters[K]
}

// zamiana parametrow URL na filtry
export function filtersFromParams(params: URLSearchParams): MatchFilters {
  const leagueId = Number(params.get("league"))
  return {
    temp: bandsFromParams(params, "temp"),
    precip: bandsFromParams(params, "precip"),
    precipType: bandsFromParams(params, "precipType"),
    wind: bandsFromParams(params, "wind"),
    query: params.get("q") ?? "",
    season: params.get("season") ?? "all",
    leagueId: Number.isInteger(leagueId) && leagueId > 0 ? leagueId : "all",
    dateFrom: params.get("from") ?? "",
    dateTo: params.get("to") ?? "",
  }
}

// zamiana filtrów na parametry URL
export function filtersToParams(filters: MatchFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const { key } of weatherAxes) {
    for (const band of filters[key]) params.append(key, band)
  }
  if (filters.query.trim() !== "") params.set("q", filters.query)
  if (filters.season !== "all") params.set("season", filters.season)
  if (filters.leagueId !== "all") params.set("league", String(filters.leagueId))
  if (filters.dateFrom !== "") params.set("from", filters.dateFrom)
  if (filters.dateTo !== "") params.set("to", filters.dateTo)
  return params
}

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