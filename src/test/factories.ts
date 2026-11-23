import type {
  Team,
  TeamRanking,
  TeamWeatherScores,
  User,
  UserAccount,
  Weather,
  WeatherCategoryKey,
  WeatherConditions,
} from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";

export function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 1,
    name: "Legia Warszawa",
    short_name: "LEG",
    city: "Warszawa",
    country: "Polska",
    league_id: 1,
    home_stadium_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    league: null,
    homeStadium: null,
    ...overrides,
  };
}

export function makeMatch(overrides: Partial<MatchWithWeather> = {}): MatchWithWeather {
  return {
    id: 1,
    home_team_id: 1,
    away_team_id: 2,
    home_goals: 0,
    away_goals: 0,
    datetime: "2026-08-01T18:00:00Z",
    home_expected_goals_xg: 1,
    away_expected_goals_xg: 1,
    home_win_odds: null,
    draw_odds: null,
    away_win_odds: null,
    season: "2025/2026",
    league_id: 1,
    homeTeam: makeTeam({ id: 1 }),
    awayTeam: makeTeam({ id: 2, name: "Lech Poznań", short_name: "LPO", city: "Poznań" }),
    weather: null,
    ...overrides,
  } as MatchWithWeather;
}

export function makeWeather(conditions: Partial<WeatherConditions> = {}): Weather {
  return {
    match_id: 1,
    temperature_c: 15,
    feels_like_c: 15,
    precipitation_mm: 0,
    rain_mm: 0,
    snowfall_cm: 0,
    wind_speed_kmh: 10,
    humidity_pct: 60,
    cloud_cover_pct: 50,
    conditions: {
      temperature: "normal",
      precipitation: "none",
      wind: "light",
      precipitation_type: null,
      difficult: false,
      ...conditions,
    },
  };
}

export function makeTeamScores(
  teamId: number,
  { factor, category }: WeatherCategoryKey,
  score: number,
  matchesCount: number,
): TeamWeatherScores {
  const teamScores: TeamWeatherScores = {
    team_id: teamId,
    team_name: `Drużyna ${teamId}`,
    computed_at: "2026-11-01T00:00:00Z",
    scores: {
      precipitation: { none: null, light: null, heavy: null },
      temperature: { low: null, normal: null, high: null },
      wind: { calm: null, light: null, strong: null },
    },
  };
  const factorScores: Record<string, unknown> = teamScores.scores[factor];
  factorScores[category] = { score, matches_count: matchesCount };
  return teamScores;
}

export function makeRanking(overrides: Partial<TeamRanking> = {}): TeamRanking {
  return {
    team_id: 1,
    team_name: "Legia Warszawa",
    matches: 0,
    goals_scored: 0,
    goals_conceded: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    avg_goals_scored: 0,
    avg_goals_conceded: 0,
    avg_xg: null,
    avg_xga: null,
    avg_possession: null,
    avg_shots: null,
    avg_shots_on_target: null,
    xg_ratio: null,
    ...overrides,
  };
}

export function makeUser(permissions: string[]): User {
  return { id: 1, email: "jan@example.com", role: "user", permissions };
}

export function makeUserAccount(id: number, email: string): UserAccount {
  return { id, email, role_id: null, created_at: "2026-01-01T00:00:00Z", role: null };
}
