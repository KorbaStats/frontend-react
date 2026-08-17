// Mirrors LeaguesController (GET /api/leagues) — public.

import { leagues } from "@/data/leagues";
import type { League, PaginatedResponse } from "@/data/types";

/** GET /api/leagues — paginated, sorted by `id`. */
export async function getLeagues(): Promise<PaginatedResponse<League>> {
  return {
    data: leagues,
    pagination: { total: leagues.length, page: 1, limit: leagues.length, pages: 1 },
  }
}
