// Mirrors MatchesController (GET /api/matches, GET /api/matches/:id).
//
// One caveat about weather: the backend has no weather data at all yet (there
// is no `weather` table, no column, no endpoint — verified 2026-08-05). The
// agreed contract is that weather will eventually arrive nested on the match
// payload, the same way homeTeam/awayTeam/stadium/league already do via
// Objection's withGraphFetched. Until then it is joined in from the local
// mock here, in ONE place, so switching to a real fetch touches one function.
//TODO: verify against real API response once the backend has weather

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";
import type { Match, PaginatedResponse, Weather } from "@/data/types";

export type MatchWithWeather = Match & { weather: Weather | null };

function withWeather(match: Match): MatchWithWeather {
  return { ...match, weather: weatherByMatchId.get(match.id) ?? null };
}

function byNewestFirst(a: Match, b: Match): number {
  return b.datetime.localeCompare(a.datetime);
}

/**
 * GET /api/matches
 *
 * The real endpoint is paginated (helpers/pagination.js: 20 per page,
 * max 100) and supports `league_id`, `season`, `home_team_id`,
 * `away_team_id`, `page`, `limit`, `sort`, `order`.
 */
export async function getMatches(): Promise<PaginatedResponse<MatchWithWeather>> {
  const data = matches.map(withWeather);

  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length, pages: 1 },
  };
}

/** GET /api/matches?sort=datetime&order=desc&limit=N */
const DEFAULT_MATCHES_LIMIT = 8;

export async function getRecentMatches(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return [...data].sort(byNewestFirst).slice(0, limit);
}

/**
 * All matches of one team, home or away, newest first.
 *
 * NOTE: no single endpoint covers this today — GET /api/matches only filters
 * `home_team_id` OR `away_team_id` separately. MatchStatsController._applyFilters
 * already implements the OR semantics under a `team_id` param, so the proposed
 * backend change is to accept the same `team_id` on GET /api/matches.
 *TODO: switch to GET /api/matches?team_id=X once the backend accepts it
 */
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return data
    .filter((m) => m.home_team_id === teamId || m.away_team_id === teamId)
    .sort(byNewestFirst);
}

/** GET /api/matches/:id */
export async function getMatchById(id: number): Promise<MatchWithWeather> {
  const match = matches.find((m) => m.id === id);
  if (!match) throw new Error(`Match id=${id} not found`);
  return withWeather(match);
}
