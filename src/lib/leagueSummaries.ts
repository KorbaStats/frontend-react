import type { League } from "@/data/types"
import type { MatchWithWeather } from "@/services/matchesService"
import {
  computeLeagueWeatherSummary,
  type LeagueWeatherSummary,
} from "./leagueWeather"

export type LeagueSummary = {
  league: League
  teamsCount: number
  matchesCount: number
  weather: LeagueWeatherSummary | null
}

export function computeLeagueSummaries(
  leagues: League[],
  matches: MatchWithWeather[],
): LeagueSummary[] {
  const byLeague = new Map<number, MatchWithWeather[]>()
  for (const match of matches) {
    if (match.league_id === null) continue
    const bucket = byLeague.get(match.league_id) ?? []
    bucket.push(match)
    byLeague.set(match.league_id, bucket)
  }

  return leagues.map((league) => {
    const leagueMatches = byLeague.get(league.id) ?? []
    const teamIds = new Set<number>()
    for (const match of leagueMatches) {
      teamIds.add(match.home_team_id)
      teamIds.add(match.away_team_id)
    }

    return {
      league,
      teamsCount: teamIds.size,
      matchesCount: leagueMatches.length,
      weather: computeLeagueWeatherSummary(leagueMatches),
    }
  })
}
