// Shared data contracts for mocked API responses.
// Source of truth: /.claude/mocks_plan.md — full backend analysis performed 2026-07-16
// against /Users/kuba/dev/KorbaStats/backend (Express 5 + Objection/Knex + Postgres).
// Field types mirror what the real endpoints return today, including backend
// quirks (e.g. some stats endpoints return raw SQL results as strings, not numbers).

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ---------------------------------------------------------------------------
// Core domain entities (migrations + CRUD controllers)
// ---------------------------------------------------------------------------

export type League = {
  id: number
  name: string
  country: string
  slug: string
  active: boolean
  created_at: string
  updated_at: string
}

export type Stadium = {
  id: number
  name: string
  city: string
  capacity: number
  longitude: number
  latitude: number
  address: string
  created_at: string
  updated_at: string
}

export type Team = {
  id: number
  name: string
  short_name: string
  city: string
  country: string
  league_id: number | null
  home_stadium_id: number | null
  created_at: string
  updated_at: string
  // Objection's withGraphFetched("[league, homeStadium]") returns full rows
  // (jsonSchema only validates writes, no controller restricts SELECT
  // columns) — nested objects carry created_at/updated_at too.
  league: League | null
  homeStadium: Stadium | null
}

// jsonb columns on `matches` — shape undocumented on the backend, minimal
// plausible structure used here.
//TODO: verify against real API response
export type PassStat = { total: number; accurate: number }
//TODO: verify against real API response
export type CrossStat = { total: number; accurate: number }
//TODO: verify against real API response
export type TackleStat = { total: number; won: number }

export type Match = {
  id: number
  home_team_id: number
  away_team_id: number
  home_goals: number
  away_goals: number
  datetime: string
  referee: string | null
  stadium_id: number | null
  attendance: number | null

  home_expected_goals_xg: number
  away_expected_goals_xg: number
  home_ball_possession: number
  away_ball_possession: number
  home_total_shots: number
  away_total_shots: number
  home_shots_on_target: number
  away_shots_on_target: number
  home_corner_kicks: number
  away_corner_kicks: number
  home_yellow_cards: number
  away_yellow_cards: number
  home_red_cards: number
  away_red_cards: number
  home_xg_on_target_xgot: number
  away_xg_on_target_xgot: number
  home_expected_assists_xa: number
  away_expected_assists_xa: number
  home_win_odds: number
  draw_odds: number
  away_win_odds: number

  season: string | null
  league_id: number | null
  created_at: string
  updated_at: string

  homeTeam: Team
  awayTeam: Team
  stadium: Stadium | null
  league: League | null

  // Remaining `matches` columns. Populated only on the 1-2 example matches in
  // matches.ts that demonstrate the full GET /api/matches/:id shape — every
  // other mocked match only carries the "core" fields above.
  home_big_chances?: number
  away_big_chances?: number
  home_shots_off_target?: number
  away_shots_off_target?: number
  home_blocked_shots?: number
  away_blocked_shots?: number
  home_shots_inside_the_box?: number
  away_shots_inside_the_box?: number
  home_shots_outside_the_box?: number
  away_shots_outside_the_box?: number
  home_hit_the_woodwork?: number
  away_hit_the_woodwork?: number
  home_headed_goals?: number
  away_headed_goals?: number
  home_touches_in_opposition_box?: number
  away_touches_in_opposition_box?: number
  home_accurate_through_passes?: number
  away_accurate_through_passes?: number
  home_offsides?: number
  away_offsides?: number
  home_free_kicks?: number
  away_free_kicks?: number
  home_passes?: PassStat
  away_passes?: PassStat
  home_long_passes?: PassStat
  away_long_passes?: PassStat
  home_passes_in_final_third?: PassStat
  away_passes_in_final_third?: PassStat
  home_crosses?: CrossStat
  away_crosses?: CrossStat
  home_tackles?: TackleStat
  away_tackles?: TackleStat
  home_throw_ins?: number
  away_throw_ins?: number
  home_fouls?: number
  away_fouls?: number
  home_duels_won?: number
  away_duels_won?: number
  home_clearances?: number
  away_clearances?: number
  home_interceptions?: number
  away_interceptions?: number
  home_errors_leading_to_shot?: number
  away_errors_leading_to_shot?: number
  home_errors_leading_to_goal?: number
  away_errors_leading_to_goal?: number
  home_goalkeeper_saves?: number
  away_goalkeeper_saves?: number
  home_xgot_faced?: number
  away_xgot_faced?: number
  home_goals_prevented?: number
  away_goals_prevented?: number
}

// ---------------------------------------------------------------------------
// match-stats (MatchStatsController) — some endpoints return raw knex.raw
// results, i.e. every numeric value comes back as a string. Kept as `string`
// here on purpose so consumers must parseFloat/parseInt, same as against the
// real API.
// ---------------------------------------------------------------------------

export type MatchStatsSummary = {
  total_matches: string
  avg_goals_per_match: string
  avg_home_goals: string
  avg_away_goals: string
  avg_attendance: string
  home_wins: string
  away_wins: string
  draws: string
}

export type GoalsOverTimePoint = {
  period: string
  avg_home_goals: string
  avg_away_goals: string
  avg_total_goals: string
  match_count: string
}

export type AttendanceOverTimePoint = {
  period: string
  avg_attendance: string
  match_count: string
}

// by-team is parsed to numbers in the controller (parseInt/parseFloat).
export type TeamStatsByTeam = {
  team_id: number
  team_name: string
  matches: number
  goals_scored: number
  goals_conceded: number
  wins: number
  draws: number
  losses: number
  avg_home_attendance: number
  avg_goals_scored: number
  avg_goals_conceded: number
  points: number
}

// by-league stays as raw strings except league_id/league_name.
export type TeamStatsByLeague = {
  league_id: number
  league_name: string
  match_count: string
  avg_goals: string
  avg_attendance: string
}

// ---------------------------------------------------------------------------
// team-stats (TeamStatsController)
// ---------------------------------------------------------------------------

// rankings is fully parsed to numbers (or null when there's no data).
export type TeamRanking = {
  team_id: number
  team_name: string
  matches: number
  goals_scored: number
  goals_conceded: number
  wins: number
  draws: number
  losses: number
  points: number
  avg_goals_scored: number
  avg_goals_conceded: number
  avg_xg: number | null
  avg_xga: number | null
  avg_possession: number | null
  avg_shots: number | null
  avg_shots_on_target: number | null
  xg_ratio: number | null
}

// over-time (per team) is raw knex.raw output — strings, unlike `rankings`.
// This mirrors a real backend inconsistency between the two endpoints.
export type TeamStatsOverTimePoint = {
  period: string
  match_count: string
  avg_goals_scored: string
  avg_goals_conceded: string
  avg_xg: string
  avg_possession: string
  avg_shots: string
}

// ---------------------------------------------------------------------------
// Weather — invented contract, the backend has nothing like this yet.
// ---------------------------------------------------------------------------

//TODO: verify against real API response
export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "snow"
  | "wind"
  | "extreme_heat"
  | "extreme_cold"

//TODO: verify against real API response
export type Weather = {
  match_id: number
  temperature_c: number
  feels_like_c: number
  precipitation_mm: number
  wind_speed_kmh: number
  humidity_pct: number
  cloud_cover_pct: number
  condition: WeatherCondition
}

// Aggregate powering the product's "weather score" feature (see CLAUDE.md).
//TODO: verify against real API response
export type TeamWeatherScore = {
  team_id: number
  condition: WeatherCondition
  sample_size: number
  avg_points_per_match: number
  // normalized -1..1 vs. the team's average across all weather conditions
  weather_score: number
}
