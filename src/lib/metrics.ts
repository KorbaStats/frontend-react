// liczone z perspektywy jednej drużyny — analiza ligowa bierze mecz dwa razy
import type { MatchWithWeather } from "@/services/matchesService"

export type Metric = {
  key: string
  label: string
  unit: string
  higherIsBetter: boolean
  get: (match: MatchWithWeather, teamId: number) => number | null
}

function isHome(match: MatchWithWeather, teamId: number): boolean {
  return match.home_team_id === teamId
}

function pick<T>(home: T | undefined, away: T | undefined, atHome: boolean): T | null {
  const value = atHome ? home : away
  return value ?? null
}

function ratio(part: number | null, whole: number | null): number | null {
  if (part === null || whole === null || whole === 0) return null
  return (part / whole) * 100
}

export const metrics: Metric[] = [
  {
    key: "pass_accuracy",
    label: "Celność podań",
    unit: "%",
    higherIsBetter: true,
    get: (m, teamId) => pick(m.home_passes, m.away_passes, isHome(m, teamId))?.pct ?? null,
  },
  {
    key: "cross_accuracy",
    label: "Celność dośrodkowań",
    unit: "%",
    higherIsBetter: true,
    get: (m, teamId) => pick(m.home_crosses, m.away_crosses, isHome(m, teamId))?.pct ?? null,
  },
  {
    key: "shot_accuracy",
    label: "Celność strzałów",
    unit: "%",
    higherIsBetter: true,
    get: (m, teamId) => {
      const atHome = isHome(m, teamId)
      const onTarget = atHome ? m.home_shots_on_target : m.away_shots_on_target
      const total = atHome ? m.home_total_shots : m.away_total_shots
      return ratio(onTarget, total)
    },
  },
  {
    key: "goals_minus_xg",
    label: "Gole − xG",
    unit: "",
    higherIsBetter: true,
    get: (m, teamId) => {
      const atHome = isHome(m, teamId)
      const goals = atHome ? m.home_goals : m.away_goals
      const xg = atHome ? m.home_expected_goals_xg : m.away_expected_goals_xg
      return goals - xg
    },
  },
  {
    key: "possession",
    label: "Posiadanie piłki",
    unit: "%",
    higherIsBetter: true,
    get: (m, teamId) => (isHome(m, teamId) ? m.home_ball_possession : m.away_ball_possession),
  },
  {
    key: "fouls",
    label: "Faule",
    unit: "",
    higherIsBetter: false,
    get: (m, teamId) => (isHome(m, teamId) ? m.home_fouls : m.away_fouls),
  },
  {
    key: "goals_scored",
    label: "Gole strzelone",
    unit: "",
    higherIsBetter: true,
    get: (m, teamId) => (isHome(m, teamId) ? m.home_goals : m.away_goals),
  },
]

export const defaultMetricKey = "pass_accuracy"

export function metricByKey(key: string): Metric {
  const metric = metrics.find((m) => m.key === key)
  if (!metric) throw new Error(`Unknown metric: ${key}`)
  return metric
}

const xgDiff: Metric = {
  key: "xg_diff",
  label: "Różnica xG",
  unit: "",
  higherIsBetter: true,
  get: (m, teamId) => {
    const atHome = isHome(m, teamId)
    return atHome
      ? m.home_expected_goals_xg - m.away_expected_goals_xg
      : m.away_expected_goals_xg - m.home_expected_goals_xg
  },
}

const points: Metric = {
  key: "points",
  label: "Punkty",
  unit: "",
  higherIsBetter: true,
  get: (m, teamId) => {
    const atHome = isHome(m, teamId)
    const scored = atHome ? m.home_goals : m.away_goals
    const conceded = atHome ? m.away_goals : m.home_goals
    if (scored === conceded) return 1
    return scored > conceded ? 3 : 0
  },
}

// wagi eksperckie
export const performanceComponents = [
  { metric: xgDiff, weight: 0.5 },
  { metric: metricByKey("pass_accuracy"), weight: 0.3 },
  { metric: points, weight: 0.2 },
]
