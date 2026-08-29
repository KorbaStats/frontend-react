import type { MatchWithWeather } from "@/services/matchesService"
import type { Metric } from "./metrics"
import { performanceComponents } from "./metrics"
import {
  profileFor,
  bandLabel,
  type WeatherAxisKey,
  type WeatherProfile,
} from "./weatherProfile"

export const MIN_BAND_OBSERVATIONS = 8
export const MIN_PER_SIDE = 4
export const SHRINKAGE_K = 10
export const SCORE_SCALE_SD = 0.6

export type Observation = {
  match: MatchWithWeather
  teamId: number
  profile: WeatherProfile
  value: number
  z: number
}

type Stats = { mean: number; sd: number; n: number }

function baselineKey(match: MatchWithWeather): string {
  return `${match.league_id ?? "?"}|${match.season ?? "?"}`
}

function meanOf(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function statsOf(values: number[]): Stats {
  const mean = meanOf(values)
  const variance = meanOf(values.map((v) => (v - mean) ** 2))
  return { mean, sd: Math.sqrt(variance), n: values.length }
}

// zawsze pełny zbiór meczów — baseline liczy się z całej ligi
export function observationsFor(matches: MatchWithWeather[], metric: Metric): Observation[] {
  const raw: Omit<Observation, "z">[] = []

  for (const match of matches) {
    if (match.weather === null) continue
    const profile = profileFor(match.weather)

    for (const teamId of [match.home_team_id, match.away_team_id]) {
      const value = metric.get(match, teamId)
      if (value === null || Number.isNaN(value)) continue
      raw.push({ match, teamId, profile, value })
    }
  }

  const groups = new Map<string, number[]>()
  for (const obs of raw) {
    const key = baselineKey(obs.match)
    const bucket = groups.get(key)
    if (bucket) bucket.push(obs.value)
    else groups.set(key, [obs.value])
  }

  const baselines = new Map<string, Stats>()
  for (const [key, values] of groups) baselines.set(key, statsOf(values))

  return raw.map((obs) => {
    const stats = baselines.get(baselineKey(obs.match))
    const z = !stats || stats.n < 2 || stats.sd < 1e-9 ? 0 : (obs.value - stats.mean) / stats.sd
    return { ...obs, z }
  })
}

export function onlyTeam(observations: Observation[], teamId: number): Observation[] {
  return observations.filter((obs) => obs.teamId === teamId)
}

export type BandEffect = {
  band: string
  label: string
  n: number
  avgValue: number
  meanZ: number
  effect: number
  reliable: boolean
}

function shrink(value: number, n: number): number {
  return value * (n / (n + SHRINKAGE_K))
}

export function effectsByBand(
  observations: Observation[],
  axis: WeatherAxisKey,
): BandEffect[] {
  const groups = new Map<string, Observation[]>()
  for (const obs of observations) {
    const band = obs.profile[axis]
    const bucket = groups.get(band)
    if (bucket) bucket.push(obs)
    else groups.set(band, [obs])
  }

  const result: BandEffect[] = []
  for (const [band, group] of groups) {
    const meanZ = meanOf(group.map((o) => o.z))
    result.push({
      band,
      label: bandLabel(axis, band),
      n: group.length,
      avgValue: meanOf(group.map((o) => o.value)),
      meanZ,
      effect: shrink(meanZ, group.length),
      reliable: group.length >= MIN_BAND_OBSERVATIONS,
    })
  }
  return result
}

export function severityScatter(observations: Observation[]) {
  return observations.map((obs) => ({
    severity: obs.profile.severity,
    z: obs.z,
    value: obs.value,
    matchId: obs.match.id,
  }))
}

export type PerformancePoint = {
  matchId: number
  teamId: number
  profile: WeatherProfile
  performance: number
}

export function performancePoints(matches: MatchWithWeather[]): PerformancePoint[] {
  const accumulator = new Map<string, {
    matchId: number
    teamId: number
    profile: WeatherProfile
    weighted: number
    weight: number
  }>()

  for (const { metric, weight } of performanceComponents) {
    for (const obs of observationsFor(matches, metric)) {
      const key = `${obs.match.id}|${obs.teamId}`
      const entry = accumulator.get(key)
      if (entry) {
        entry.weighted += weight * obs.z
        entry.weight += weight
      } else {
        accumulator.set(key, {
          matchId: obs.match.id,
          teamId: obs.teamId,
          profile: obs.profile,
          weighted: weight * obs.z,
          weight,
        })
      }
    }
  }

  // dzielone przez sumę obecnych wag, brak statystyki nie zaniża oceny
  return [...accumulator.values()].map((entry) => ({
    matchId: entry.matchId,
    teamId: entry.teamId,
    profile: entry.profile,
    performance: entry.weight === 0 ? 0 : entry.weighted / entry.weight,
  }))
}

export function deltaToScore(harsh: number[], benign: number[]): number | null {
  if (harsh.length < MIN_PER_SIDE || benign.length < MIN_PER_SIDE) return null
  const n = harsh.length + benign.length

  const delta = meanOf(harsh) - meanOf(benign)
  const scaled = shrink(delta, n) / SCORE_SCALE_SD
  return 50 + 50 * Math.min(Math.max(scaled, -1), 1)
}

// tercyle liczone na wszystkich meczach, nie per drużyna
export function severityTerciles(points: PerformancePoint[]): [number, number] {
  const sorted = points.map((p) => p.profile.severity).sort((a, b) => a - b)
  if (sorted.length < 3) return [0, 1]
  return [
    sorted[Math.floor(sorted.length / 3)],
    sorted[Math.floor((sorted.length * 2) / 3)],
  ]
}

export type AxisScore = {
  key: string
  label: string
  score: number | null
  harshMatches: number
  benignMatches: number
}

export type WeatherScore = {
  score: number | null
  matches: number
  harshMatches: number
  benignMatches: number
  byAxis: AxisScore[]
}

const axisScoreDefs = [
  {
    key: "rain",
    label: "Deszcz",
    harsh: (p: WeatherProfile) => p.precip === "light" || p.precip === "heavy",
    benign: (p: WeatherProfile) => p.precip === "dry",
  },
  {
    key: "wind",
    label: "Wiatr",
    harsh: (p: WeatherProfile) => p.wind === "strong",
    benign: (p: WeatherProfile) => p.wind === "calm",
  },
  {
    key: "cold",
    label: "Zimno",
    harsh: (p: WeatherProfile) => p.temp === "freezing" || p.temp === "cold",
    benign: (p: WeatherProfile) => p.temp === "mild",
  },
  {
    key: "heat",
    label: "Upał",
    harsh: (p: WeatherProfile) => p.temp === "hot",
    benign: (p: WeatherProfile) => p.temp === "mild",
  },
]

export function computeWeatherScore(
  allMatches: MatchWithWeather[],
  teamId: number,
): WeatherScore {
  const all = performancePoints(allMatches)
  const [lower, upper] = severityTerciles(all)
  const own = all.filter((p) => p.teamId === teamId)

  const harsh = own.filter((p) => p.profile.severity >= upper).map((p) => p.performance)
  const benign = own.filter((p) => p.profile.severity <= lower).map((p) => p.performance)

  const byAxis = axisScoreDefs.map((def) => {
    const harshSide = own.filter((p) => def.harsh(p.profile)).map((p) => p.performance)
    const benignSide = own.filter((p) => def.benign(p.profile)).map((p) => p.performance)
    return {
      key: def.key,
      label: def.label,
      score: deltaToScore(harshSide, benignSide),
      harshMatches: harshSide.length,
      benignMatches: benignSide.length,
    }
  })

  return {
    score: deltaToScore(harsh, benign),
    matches: own.length,
    harshMatches: harsh.length,
    benignMatches: benign.length,
    byAxis,
  }
}
