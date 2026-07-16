// Mocked data - change later for backend endpoints
// Shape verified against TeamStatsController (GET /api/team-stats/*).
// Computed from matches.ts so numbers stay consistent with the match list —
// see matchStats.ts for the same approach.

import { matches } from "./matches"
import type { TeamRanking, TeamStatsOverTimePoint } from "./types"

function periodOf(datetime: string): string {
  return datetime.slice(0, 7) // "YYYY-MM"
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length
}

function averageOrNull(values: number[], decimals = 3): number | null {
  return values.length === 0 ? null : Number(average(values).toFixed(decimals))
}

type TeamMatchRow = {
  goalsScored: number
  goalsConceded: number
  result: "win" | "draw" | "loss"
  xg: number
  xga: number
  possession: number
  shots: number
  shotsOnTarget: number
  period: string
}

function perTeamRows(teamId: number): TeamMatchRow[] {
  const rows: TeamMatchRow[] = []
  for (const match of matches) {
    if (match.home_team_id === teamId) {
      rows.push({
        goalsScored: match.home_goals,
        goalsConceded: match.away_goals,
        result:
          match.home_goals > match.away_goals ? "win" : match.home_goals < match.away_goals ? "loss" : "draw",
        xg: match.home_expected_goals_xg,
        xga: match.away_expected_goals_xg,
        possession: match.home_ball_possession,
        shots: match.home_total_shots,
        shotsOnTarget: match.home_shots_on_target,
        period: periodOf(match.datetime),
      })
    } else if (match.away_team_id === teamId) {
      rows.push({
        goalsScored: match.away_goals,
        goalsConceded: match.home_goals,
        result:
          match.away_goals > match.home_goals ? "win" : match.away_goals < match.home_goals ? "loss" : "draw",
        xg: match.away_expected_goals_xg,
        xga: match.home_expected_goals_xg,
        possession: match.away_ball_possession,
        shots: match.away_total_shots,
        shotsOnTarget: match.away_shots_on_target,
        period: periodOf(match.datetime),
      })
    }
  }
  return rows
}

export const rankings: TeamRanking[] = (() => {
  const teamIds = new Set<number>()
  for (const match of matches) {
    teamIds.add(match.home_team_id)
    teamIds.add(match.away_team_id)
  }

  return [...teamIds]
    .map((teamId) => {
      const rows = perTeamRows(teamId)
      const teamName =
        matches.find((m) => m.home_team_id === teamId)?.homeTeam.name ??
        matches.find((m) => m.away_team_id === teamId)!.awayTeam.name

      const wins = rows.filter((r) => r.result === "win").length
      const draws = rows.filter((r) => r.result === "draw").length
      const losses = rows.filter((r) => r.result === "loss").length
      const goalsScored = rows.reduce((sum, r) => sum + r.goalsScored, 0)
      const goalsConceded = rows.reduce((sum, r) => sum + r.goalsConceded, 0)
      const sumXg = rows.reduce((sum, r) => sum + r.xg, 0)

      return {
        team_id: teamId,
        team_name: teamName,
        matches: rows.length,
        goals_scored: goalsScored,
        goals_conceded: goalsConceded,
        wins,
        draws,
        losses,
        points: wins * 3 + draws,
        avg_goals_scored: Number((goalsScored / rows.length).toFixed(2)),
        avg_goals_conceded: Number((goalsConceded / rows.length).toFixed(2)),
        avg_xg: averageOrNull(rows.map((r) => r.xg), 3),
        avg_xga: averageOrNull(rows.map((r) => r.xga), 3),
        avg_possession: averageOrNull(rows.map((r) => r.possession), 1),
        avg_shots: averageOrNull(rows.map((r) => r.shots), 2),
        avg_shots_on_target: averageOrNull(rows.map((r) => r.shotsOnTarget), 2),
        xg_ratio: sumXg > 0 ? Number((goalsScored / sumXg).toFixed(3)) : null,
      }
    })
    // matches TeamStatsController.rankings SQL: ORDER BY points DESC, goals_scored DESC
    .sort((a, b) => b.points - a.points || b.goals_scored - a.goals_scored)
})()

export function overTimeByTeam(teamId: number): TeamStatsOverTimePoint[] {
  const rows = perTeamRows(teamId)
  const byPeriod = new Map<string, TeamMatchRow[]>()
  for (const row of rows) {
    const bucket = byPeriod.get(row.period) ?? []
    bucket.push(row)
    byPeriod.set(row.period, bucket)
  }

  return [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, bucket]) => ({
      period,
      match_count: String(bucket.length),
      avg_goals_scored: average(bucket.map((r) => r.goalsScored)).toFixed(2),
      avg_goals_conceded: average(bucket.map((r) => r.goalsConceded)).toFixed(2),
      avg_xg: average(bucket.map((r) => r.xg)).toFixed(3),
      avg_possession: average(bucket.map((r) => r.possession)).toFixed(1),
      avg_shots: average(bucket.map((r) => r.shots)).toFixed(2),
    }))
}
