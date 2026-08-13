// Mirrors LeaguesController (GET /api/leagues) — public.
//
// `flag` is a frontend-only addition (see LeagueWithFlag in data/leagues.ts);
// the backend's leagues table has no such column.

import { leagues } from "@/data/leagues";
import type { LeagueWithFlag } from "@/data/leagues";
import type { PaginatedResponse } from "@/data/types";

/** GET /api/leagues — paginated, sorted by `id`. */
export async function getLeagues(): Promise<PaginatedResponse<LeagueWithFlag>> {
  return {
    data: leagues,
    pagination: { total: leagues.length, page: 1, limit: leagues.length, pages: 1 },
  }
}