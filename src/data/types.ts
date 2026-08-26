// Wspólne kontrakty danych dla zamockowanych odpowiedzi API.
// Typy pól odwzorowują to, co dziś zwracają prawdziwe endpointy, razem z
// dziwactwami backendu (np. część endpointów statystyk zwraca surowy wynik SQL
// jako stringi, a nie liczby).

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
// Główne encje domenowe (migracje + kontrolery CRUD)
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
  // withGraphFetched("[league, homeStadium]") z Objection zwraca pełne wiersze
  // (jsonSchema waliduje tylko zapisy, żaden kontroler nie ogranicza kolumn
  // w SELECT) — zagnieżdżone obiekty niosą też created_at/updated_at.
  league: League | null
  homeStadium: Stadium | null
}

// Kolumny jsonb w tabeli `matches`. Backend deklaruje je tylko jako
// `{ type: ["object", "null"] }` (Match.jsonSchema), więc o realnym kształcie
// decyduje scraper — `parseStat()` w scraper/src/scraper/match.js zwraca
// `{ pct, completed, total }` dla każdej statystyki typu "x% (n/m)" odczytanej
// ze strony źródłowej. Jeden kształt obsługuje podania, dośrodkowania i odbiory.
// Zweryfikowane ze scraperem 2026-08-05 — NIE zmieniaj nazw tych kluczy,
// patrz "Data contract boundary" w CLAUDE.md.
export type ParsedStat = { pct: number; completed: number; total: number }

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
  home_fouls: number
  away_fouls: number
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

  // Pozostałe kolumny `matches` — pełny kształt GET /api/matches/:id.
  // Opcjonalne, bo prawdziwe kolumny są nullowalne: scraper zapisuje null,
  // gdy statystyka była niedostępna.
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
  home_passes?: ParsedStat
  away_passes?: ParsedStat
  home_long_passes?: ParsedStat
  away_long_passes?: ParsedStat
  home_passes_in_final_third?: ParsedStat
  away_passes_in_final_third?: ParsedStat
  home_crosses?: ParsedStat
  away_crosses?: ParsedStat
  home_tackles?: ParsedStat
  away_tackles?: ParsedStat
  home_throw_ins?: number
  away_throw_ins?: number
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
// match-stats (MatchStatsController) — część endpointów zwraca surowy wynik
// knex.raw, czyli każda wartość liczbowa wraca jako string. Stąd `string` tutaj,
// żeby konsumenci robili parseFloat/parseInt tak jak przy prawdziwym API.
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

// by-team jest parsowane do liczb już w kontrolerze (parseInt/parseFloat).
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

// by-league zostaje surowymi stringami poza league_id/league_name.
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

// rankings jest w pełni sparsowane do liczb (albo null, gdy brak danych).
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

// over-time (dla drużyny) to surowe wyjście knex.raw — stringi, inaczej niż
// `rankings`. Tak samo niespójnie zachowuje się backend.
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
// Pogoda — kontrakt wymyślony, backend nie ma jeszcze nic podobnego.
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

// Nie ma tu typu TeamWeatherScore — weather score jest wyliczany z meczów,
// a nie przechowywany, więc nie ma czego mockować.
