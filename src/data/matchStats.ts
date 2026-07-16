// Mocked data - change later for backend endpoints
// Shape verified against MatchStatsController (GET /api/match-stats/*).
// Values are computed from matches.ts instead of being hand-typed, so
// aggregates (wins/draws/losses, points, etc.) always stay consistent with
// the underlying match list.
//
// summary / goals-over-time / attendance-over-time hit knex.raw() on the
// backend with no JS-side parsing, so every numeric value comes back as a
// string — reproduced here on purpose (see types.ts).

import { matches } from "./matches"
import { leagues } from "./leagues"
import type {
  AttendanceOverTimePoint,
  GoalsOverTimePoint,
  MatchStatsSummary,
  TeamStatsByLeague,
  TeamStatsByTeam,
} from "./types"

function periodOf(datetime: string): string {
  return datetime.slice(0, 7) // "YYYY-MM"
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length
}

export const summary: MatchStatsSummary = (() => {
  const totalGoals = matches.map((m) => m.home_goals + m.away_goals)
  const attendances = matches.filter((m) => m.attendance != null).map((m) => m.attendance!)
  const homeWins = matches.filter((m) => m.home_goals > m.away_goals).length
  const awayWins = matches.filter((m) => m.away_goals > m.home_goals).length
  const draws = matches.filter((m) => m.home_goals === m.away_goals).length

  return {
    total_matches: String(matches.length),
    avg_goals_per_match: average(totalGoals).toFixed(2),
    avg_home_goals: average(matches.map((m) => m.home_goals)).toFixed(2),
    avg_away_goals: average(matches.map((m) => m.away_goals)).toFixed(2),
    avg_attendance: String(Math.round(average(attendances))),
    home_wins: String(homeWins),
    away_wins: String(awayWins),
    draws: String(draws),
  }
})()

export const goalsOverTime: GoalsOverTimePoint[] = (() => {
  const byPeriod = new Map<string, typeof matches>()
  for (const match of matches) {
    const period = periodOf(match.datetime)
    const bucket = byPeriod.get(period) ?? []
    bucket.push(match)
    byPeriod.set(period, bucket)
  }

  return [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, bucket]) => ({
      period,
      avg_home_goals: average(bucket.map((m) => m.home_goals)).toFixed(2),
      avg_away_goals: average(bucket.map((m) => m.away_goals)).toFixed(2),
      avg_total_goals: average(bucket.map((m) => m.home_goals + m.away_goals)).toFixed(2),
      match_count: String(bucket.length),
    }))
})()

export const attendanceOverTime: AttendanceOverTimePoint[] = (() => {
  const withAttendance = matches.filter((m) => m.attendance != null)
  const byPeriod = new Map<string, typeof withAttendance>()
  for (const match of withAttendance) {
    const period = periodOf(match.datetime)
    const bucket = byPeriod.get(period) ?? []
    bucket.push(match)
    byPeriod.set(period, bucket)
  }

  return [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, bucket]) => ({
      period,
      avg_attendance: String(Math.round(average(bucket.map((m) => m.attendance!)))),
      match_count: String(bucket.length),
    }))
})()

export const byTeam: TeamStatsByTeam[] = (() => {
  type Acc = {
    team_id: number
    team_name: string
    matches: number
    goals_scored: number
    goals_conceded: number
    wins: number
    draws: number
    losses: number
    homeAttendances: number[]
  }
  const acc = new Map<number, Acc>()

  function ensure(teamId: number, teamName: string): Acc {
    let entry = acc.get(teamId)
    if (!entry) {
      entry = {
        team_id: teamId,
        team_name: teamName,
        matches: 0,
        goals_scored: 0,
        goals_conceded: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        homeAttendances: [],
      }
      acc.set(teamId, entry)
    }
    return entry
  }

  for (const match of matches) {
    const home = ensure(match.home_team_id, match.homeTeam.name)
    home.matches += 1
    home.goals_scored += match.home_goals
    home.goals_conceded += match.away_goals
    if (match.attendance != null) home.homeAttendances.push(match.attendance)
    if (match.home_goals > match.away_goals) home.wins += 1
    else if (match.home_goals < match.away_goals) home.losses += 1
    else home.draws += 1

    const away = ensure(match.away_team_id, match.awayTeam.name)
    away.matches += 1
    away.goals_scored += match.away_goals
    away.goals_conceded += match.home_goals
    if (match.away_goals > match.home_goals) away.wins += 1
    else if (match.away_goals < match.home_goals) away.losses += 1
    else away.draws += 1
  }

  return [...acc.values()]
    .map((t) => ({
      team_id: t.team_id,
      team_name: t.team_name,
      matches: t.matches,
      goals_scored: t.goals_scored,
      goals_conceded: t.goals_conceded,
      wins: t.wins,
      draws: t.draws,
      losses: t.losses,
      avg_home_attendance: Math.round(average(t.homeAttendances)),
      avg_goals_scored: Number((t.goals_scored / t.matches).toFixed(2)),
      avg_goals_conceded: Number((t.goals_conceded / t.matches).toFixed(2)),
      points: t.wins * 3 + t.draws,
    }))
    // matches MatchStatsController.byTeam: ORDER BY points DESC, goals_scored DESC
    .sort((a, b) => b.points - a.points || b.goals_scored - a.goals_scored)
})()

export const byLeague: TeamStatsByLeague[] = (() => {
  const byLeagueId = new Map<number, typeof matches>()
  for (const match of matches) {
    const leagueId = match.league_id!
    const bucket = byLeagueId.get(leagueId) ?? []
    bucket.push(match)
    byLeagueId.set(leagueId, bucket)
  }

  return [...byLeagueId.entries()].map(([leagueId, bucket]) => ({
    league_id: leagueId,
    league_name: leagues.find((l) => l.id === leagueId)!.name,
    match_count: String(bucket.length),
    avg_goals: average(bucket.map((m) => m.home_goals + m.away_goals)).toFixed(2),
    avg_attendance: String(
      Math.round(average(bucket.filter((m) => m.attendance != null).map((m) => m.attendance!))),
    ),
  }))
})()
