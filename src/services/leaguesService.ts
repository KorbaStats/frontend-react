import { leagues } from "@/data/leagues";
import type { LeagueWithFlag } from "@/data/leagues";
import type { PaginatedResponse } from "@/data/types";

export async function getLeagues(): Promise<PaginatedResponse<LeagueWithFlag>> {
  return {
    data: leagues,
    pagination: { total: leagues.length, page: 1, limit: leagues.length, pages: 1 },
  }
}