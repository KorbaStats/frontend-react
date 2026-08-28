// Odwzorowuje LeaguesController (GET /api/leagues) — publiczny.

import { leagues } from "@/data/leagues";
import type { League, PaginatedResponse } from "@/data/types";

/** GET /api/leagues — paginowany, sortowany po `id`. */
export async function getLeagues(): Promise<PaginatedResponse<League>> {
  return {
    data: leagues,
    pagination: { total: leagues.length, page: 1, limit: leagues.length, pages: 1 },
  }
}

/** GET /api/league/:id */
export async function getLeagueById(leagueId: number): Promise<League> {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) throw new Error(`League id=${leagueId} not found`);
  return league;
}