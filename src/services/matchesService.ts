import { apiGet, apiGetAllPages, apiRequest } from "@/services/http";
import type {
  Match,
  MatchInput,
  PaginatedResponse,
  Weather,
} from "@/data/types";

export type MatchWithWeather = Match & { weather: Weather | null };

const NEWEST_FIRST = { sort: "datetime", order: "desc" } as const;

// GET /api/matches?sort=datetime&order=desc
export async function getMatches(): Promise<
  PaginatedResponse<MatchWithWeather>
> {
  return apiGetAllPages<MatchWithWeather>("/api/matches", NEWEST_FIRST);
}

// GET /api/matches?sort=datetime&order=desc&limit=N
const DEFAULT_MATCHES_LIMIT = 10;

export async function getRecentMatches(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGet<PaginatedResponse<MatchWithWeather>>(
    "/api/matches",
    { ...NEWEST_FIRST, limit },
  );
  return data;
}

// GET /api/matches?team_id=X&sort=datetime&order=desc
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGetAllPages<MatchWithWeather>("/api/matches", {
    ...NEWEST_FIRST,
    team_id: teamId,
  });
  return data;
}

// GET /api/matches/:id
export async function getMatchById(id: number): Promise<MatchWithWeather> {
  return apiGet<MatchWithWeather>(`/api/matches/${id}`);
}

// GET /api/match-stats/seasons - od najnowszego
export async function getAvailableSeasons(): Promise<string[]> {
  return apiGet<string[]>("/api/match-stats/seasons");
}

// GET /api/matches?league_id=X&season=Y&sort=datetime&order=desc
export async function getLeagueMatches(
  leagueId: number,
  season?: string,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGetAllPages<MatchWithWeather>("/api/matches", {
    ...NEWEST_FIRST,
    league_id: leagueId,
    season,
  });
  return data;
}

// PATCH /api/matches/:id
export async function updateMatch(id: number, input: MatchInput): Promise<void> {
  await apiRequest(`/api/matches/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/matches/:id
export async function deleteMatch(id: number): Promise<void> {
  await apiRequest<void>(`/api/matches/${id}`, { method: "DELETE" });
}
