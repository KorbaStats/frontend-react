import { apiGet, apiGetAllPages } from "@/services/api";
import type {
  Match,
  PaginatedResponse,
  Weather,
} from "@/data/types";

export type MatchWithWeather = Match & { weather: Weather | null };

const NEWEST_FIRST = { sort: "datetime", order: "desc" } as const;

// pełna lista to kilkanaście stron po 100 meczów, a getMatches jest wołane naraz
// z kilku miejsc (strony + weatherStatsService) - współdzielimy wynik przez krótki czas
const ALL_MATCHES_TTL_MS = 60 * 1000;
let allMatchesCache: {
  fetchedAt: number;
  promise: Promise<PaginatedResponse<MatchWithWeather>>;
} | null = null;

// GET /api/matches?sort=datetime&order=desc
export async function getMatches(): Promise<
  PaginatedResponse<MatchWithWeather>
> {
  if (!allMatchesCache || Date.now() - allMatchesCache.fetchedAt > ALL_MATCHES_TTL_MS) {
    const promise = apiGetAllPages<MatchWithWeather>("/matches", NEWEST_FIRST);
    allMatchesCache = { fetchedAt: Date.now(), promise };

    promise.catch(() => {
      if (allMatchesCache?.promise === promise) allMatchesCache = null;
    });
  }

  return allMatchesCache.promise;
}

// GET /api/matches?sort=datetime&order=desc&limit=N
const DEFAULT_MATCHES_LIMIT = 10;

export async function getRecentMatches(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGet<PaginatedResponse<MatchWithWeather>>(
    "/matches",
    { ...NEWEST_FIRST, limit },
  );
  return data;
}

// GET /api/matches?team_id=X&sort=datetime&order=desc
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGetAllPages<MatchWithWeather>("/matches", {
    ...NEWEST_FIRST,
    team_id: teamId,
  });
  return data;
}

// GET /api/matches/:id
export async function getMatchById(id: number): Promise<MatchWithWeather> {
  return apiGet<MatchWithWeather>(`/matches/${id}`);
}

// GET /api/match-stats/seasons - od najnowszego
export async function getAvailableSeasons(): Promise<string[]> {
  return apiGet<string[]>("/match-stats/seasons");
}

// GET /api/matches?league_id=X&season=Y&sort=datetime&order=desc
export async function getLeagueMatches(
  leagueId: number,
  season?: string,
): Promise<MatchWithWeather[]> {
  const { data } = await apiGetAllPages<MatchWithWeather>("/matches", {
    ...NEWEST_FIRST,
    league_id: leagueId,
    season,
  });
  return data;
}
