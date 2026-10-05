// Terminarz — mecze jeszcze nierozegrane, pod predykcje.
// Do podmiany na GET /api/matches?status=scheduled.
//
// Daty liczone od dnia uruchomienia, żeby terminarz zawsze był "nadchodzący"
// bez ręcznego poprawiania mocka.

import { teams } from "./teams"
import type { ScheduledMatch, Team } from "./types"

const SEASON = "2026/2027"
const ROUNDS = 2
const KICKOFF_HOURS = [15, 17, 18, 20]

function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(20261002)

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2): number {
  return Number((rng() * (max - min) + min).toFixed(decimals))
}

function groupByLeague(allTeams: Team[]): Map<number, Team[]> {
  const byLeague = new Map<number, Team[]>()
  for (const team of allTeams) {
    if (team.league_id === null) continue
    const group = byLeague.get(team.league_id)
    if (group) group.push(team)
    else byLeague.set(team.league_id, [team])
  }
  return byLeague
}

/** Jedna kolejka: drużyny parowane po kolei, każda gra raz. */
function round(leagueTeams: Team[]): { home: Team; away: Team }[] {
  const pairs: { home: Team; away: Team }[] = []
  for (let i = 0; i + 1 < leagueTeams.length; i += 2) {
    pairs.push({ home: leagueTeams[i], away: leagueTeams[i + 1] })
  }
  return pairs
}

/** Dzisiaj + `days` dni, o podanej godzinie. */
function dateIn(days: number, hour: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  d.setUTCHours(hour, 0, 0, 0)
  return d.toISOString()
}

function generateScheduled(): ScheduledMatch[] {
  const leagueGroups = groupByLeague(teams)
  const generated: ScheduledMatch[] = []
  let nextId = 90000 // z dala od id meczów rozegranych

  for (let r = 0; r < ROUNDS; r++) {
    for (const leagueTeams of leagueGroups.values()) {
      for (const { home, away } of round(leagueTeams)) {
        const datetime = dateIn(
          r * 7 + randInt(1, 6),
          KICKOFF_HOURS[randInt(0, KICKOFF_HOURS.length - 1)],
        )
        const now = new Date().toISOString()

        generated.push({
          id: nextId++,
          home_team_id: home.id,
          away_team_id: away.id,
          datetime,
          stadium_id: home.home_stadium_id,
          season: SEASON,
          league_id: home.league_id,

          home_win_odds: randFloat(1.5, 4.2),
          draw_odds: randFloat(3.0, 4.2),
          away_win_odds: randFloat(1.8, 5.8),

          created_at: now,
          updated_at: now,

          homeTeam: home,
          awayTeam: away,
          stadium: home.homeStadium,
          league: home.league,
        })
      }
    }
  }

  return generated.sort((a, b) => a.datetime.localeCompare(b.datetime))
}

export const scheduledMatches: ScheduledMatch[] = generateScheduled()
