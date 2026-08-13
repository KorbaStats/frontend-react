// Mocked data - change later for backend endpoints
// Shape verified against the final `matches` table (after migrations
// 20260321175947, 20260522120000, 20260525123625, 20260525140000) and
// MatchesController (GET /api/matches, GET /api/matches/:id) — both endpoints
// use withGraphFetched, so every row carries nested homeTeam/awayTeam/stadium/league.
//
// Generated deterministically from a seeded RNG so the dataset stays stable
// across reloads. Only the "core" stat fields used by match-stats/team-stats
// are populated for most matches; two matches get every column (incl. the
// jsonb ones) to demonstrate the full GET /api/matches/:id shape.

import { teams } from "./teams"
import type { Match, ParsedStat, Team } from "./types"

function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(20260716)

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2): number {
  return Number((rng() * (max - min) + min).toFixed(decimals))
}

function pick<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)]
}

// Mirrors the scraper's parseStat() output for "x% (n/m)" stats. `completed`
// is derived from the percentage so the three fields always agree with each
// other (the old {total, accurate} mock could produce accurate > total).
function parsedStat(total: number, minPct: number, maxPct: number): ParsedStat {
  const pct = randInt(minPct, maxPct)
  return { pct, completed: Math.round((total * pct) / 100), total }
}

function goalsFromXg(xg: number): number {
  return Math.max(0, Math.round(xg + randFloat(-0.9, 0.9)))
}

const referees = [
  "Michael Oliver",
  "Szymon Marciniak",
  "Antonio Mateu Lahoz",
  "Felix Brych",
  "Clément Turpin",
  "Anthony Taylor",
  "Daniele Orsato",
]

function groupByLeague(allTeams: Team[]): Map<number, Team[]> {
  const groups = new Map<number, Team[]>()
  for (const team of allTeams) {
    const leagueId = team.league_id!
    const group = groups.get(leagueId) ?? []
    group.push(team)
    groups.set(leagueId, group)
  }
  return groups
}

type Fixture = { home: Team; away: Team }

// Every ordered pair once = a full home-and-away double round-robin.
function doubleRoundRobin(leagueTeams: Team[]): Fixture[] {
  const fixtures: Fixture[] = []
  for (const home of leagueTeams) {
    for (const away of leagueTeams) {
      if (home.id !== away.id) fixtures.push({ home, away })
    }
  }
  return fixtures
}

type SeasonDef = { season: string; months: { year: number; month: number }[] }

const seasonDefs: SeasonDef[] = [
  {
    season: "2024/2025",
    months: [
      { year: 2024, month: 11 },
      { year: 2024, month: 12 },
      { year: 2025, month: 1 },
      { year: 2025, month: 2 },
      { year: 2025, month: 3 },
      { year: 2025, month: 4 },
    ],
  },
  {
    season: "2025/2026",
    months: [
      { year: 2025, month: 11 },
      { year: 2025, month: 12 },
      { year: 2026, month: 1 },
      { year: 2026, month: 2 },
      { year: 2026, month: 3 },
      { year: 2026, month: 4 },
    ],
  },
]

function buildMatch(id: number, home: Team, away: Team, season: string, datetime: string): Match {
  const homeXg = randFloat(0.7, 2.6)
  const awayXg = randFloat(0.5, 2.2)
  const homeShots = randInt(8, 19)
  const awayShots = randInt(6, 17)
  const homeShotsOnTarget = randInt(2, Math.min(9, homeShots))
  const awayShotsOnTarget = randInt(2, Math.min(9, awayShots))
  const homePossession = randInt(38, 62)
  const stadium = home.homeStadium
  const attendance = stadium ? Math.round(stadium.capacity * randFloat(0.55, 0.97)) : null

  return {
    id,
    home_team_id: home.id,
    away_team_id: away.id,
    home_goals: goalsFromXg(homeXg),
    away_goals: goalsFromXg(awayXg),
    datetime,
    referee: pick(referees),
    stadium_id: home.home_stadium_id,
    attendance,

    home_expected_goals_xg: homeXg,
    away_expected_goals_xg: awayXg,
    home_ball_possession: homePossession,
    away_ball_possession: 100 - homePossession,
    home_total_shots: homeShots,
    away_total_shots: awayShots,
    home_shots_on_target: homeShotsOnTarget,
    away_shots_on_target: awayShotsOnTarget,
    home_corner_kicks: randInt(2, 11),
    away_corner_kicks: randInt(2, 11),
    home_yellow_cards: randInt(0, 4),
    away_yellow_cards: randInt(0, 4),
    home_red_cards: rng() < 0.08 ? 1 : 0,
    away_red_cards: rng() < 0.08 ? 1 : 0,
    home_fouls: randInt(6, 16), // moved from "withFullDetail" object builder
    away_fouls: randInt(6, 16), //
    home_xg_on_target_xgot: Number(Math.min(homeXg * randFloat(0.6, 1.1), homeXg + 0.4).toFixed(2)),
    away_xg_on_target_xgot: Number(Math.min(awayXg * randFloat(0.6, 1.1), awayXg + 0.4).toFixed(2)),
    home_expected_assists_xa: randFloat(0.3, 1.8),
    away_expected_assists_xa: randFloat(0.2, 1.5),
    home_win_odds: randFloat(1.5, 4.2),
    draw_odds: randFloat(3.0, 4.2),
    away_win_odds: randFloat(1.8, 5.8),

    season,
    league_id: home.league_id,
    created_at: datetime,
    updated_at: datetime,

    homeTeam: home,
    awayTeam: away,
    stadium,
    league: home.league,
  }
}

// Fills in every remaining `matches` column (incl. jsonb ones) to show the
// full GET /api/matches/:id shape. Only applied to a couple of example rows.
function withFullDetail(match: Match): Match {
  const homeShots = match.home_total_shots
  const awayShots = match.away_total_shots

  return {
    ...match,
    home_big_chances: randInt(1, 6),
    away_big_chances: randInt(1, 6),
    home_shots_off_target: Math.max(0, homeShots - match.home_shots_on_target - randInt(0, 3)),
    away_shots_off_target: Math.max(0, awayShots - match.away_shots_on_target - randInt(0, 3)),
    home_blocked_shots: randInt(0, 5),
    away_blocked_shots: randInt(0, 5),
    home_shots_inside_the_box: Math.round(homeShots * 0.65),
    away_shots_inside_the_box: Math.round(awayShots * 0.65),
    home_shots_outside_the_box: homeShots - Math.round(homeShots * 0.65),
    away_shots_outside_the_box: awayShots - Math.round(awayShots * 0.65),
    home_hit_the_woodwork: randInt(0, 2),
    away_hit_the_woodwork: randInt(0, 2),
    home_headed_goals: randInt(0, 1),
    away_headed_goals: randInt(0, 1),
    home_touches_in_opposition_box: randInt(15, 45),
    away_touches_in_opposition_box: randInt(10, 40),
    home_accurate_through_passes: randInt(1, 8),
    away_accurate_through_passes: randInt(1, 8),
    home_offsides: randInt(0, 5),
    away_offsides: randInt(0, 5),
    home_free_kicks: randInt(6, 18),
    away_free_kicks: randInt(6, 18),
    home_passes: parsedStat(randInt(380, 720), 78, 92),
    away_passes: parsedStat(randInt(320, 650), 74, 90),
    home_long_passes: parsedStat(randInt(30, 70), 40, 70),
    away_long_passes: parsedStat(randInt(30, 70), 38, 68),
    home_passes_in_final_third: parsedStat(randInt(60, 150), 62, 84),
    away_passes_in_final_third: parsedStat(randInt(50, 130), 58, 80),
    home_crosses: parsedStat(randInt(10, 28), 18, 40),
    away_crosses: parsedStat(randInt(8, 24), 16, 38),
    home_tackles: parsedStat(randInt(14, 28), 55, 78),
    away_tackles: parsedStat(randInt(14, 28), 55, 78),
    home_throw_ins: randInt(12, 26),
    away_throw_ins: randInt(12, 26),
    home_duels_won: randInt(35, 65),
    away_duels_won: randInt(35, 65),
    home_clearances: randInt(8, 26),
    away_clearances: randInt(8, 26),
    home_interceptions: randInt(6, 16),
    away_interceptions: randInt(6, 16),
    home_errors_leading_to_shot: randInt(0, 2),
    away_errors_leading_to_shot: randInt(0, 2),
    home_errors_leading_to_goal: randInt(0, 1),
    away_errors_leading_to_goal: randInt(0, 1),
    home_goalkeeper_saves: Math.max(0, match.away_shots_on_target - match.away_goals),
    away_goalkeeper_saves: Math.max(0, match.home_shots_on_target - match.home_goals),
    home_xgot_faced: match.away_xg_on_target_xgot,
    away_xgot_faced: match.home_xg_on_target_xgot,
    home_goals_prevented: Number((match.away_xg_on_target_xgot - match.away_goals).toFixed(2)),
    away_goals_prevented: Number((match.home_xg_on_target_xgot - match.home_goals).toFixed(2)),
  }
}

function generateMatches(): Match[] {
  const leagueGroups = groupByLeague(teams)
  const generated: Match[] = []
  let nextId = 1

  for (const season of seasonDefs) {
    for (const leagueTeams of leagueGroups.values()) {
      const fixtures = doubleRoundRobin(leagueTeams)
      fixtures.forEach((fixture, index) => {
        const { year, month } = season.months[index % season.months.length]
        const day = randInt(1, 27)
        const hour = pick([15, 17, 18, 20])
        const datetime = new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString()
        generated.push(buildMatch(nextId++, fixture.home, fixture.away, season.season, datetime))
      })
    }
  }

  // First generated match + the first Arsenal-Liverpool fixture get the full detail shape.
  generated[0] = withFullDetail(generated[0])
  const arsenalVsLiverpoolIndex = generated.findIndex(
    (m) => m.homeTeam.short_name === "ARS" && m.awayTeam.short_name === "LIV",
  )
  if (arsenalVsLiverpoolIndex > 0) {
    generated[arsenalVsLiverpoolIndex] = withFullDetail(generated[arsenalVsLiverpoolIndex])
  }

  return generated.sort((a, b) => a.datetime.localeCompare(b.datetime))
}

export const matches: Match[] = generateMatches()
