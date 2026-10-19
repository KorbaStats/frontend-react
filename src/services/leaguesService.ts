import { apiGetAllPages } from "@/services/http";
import type { League, PaginatedResponse } from "@/data/types";

// GET /api/leagues
export async function getLeagues(): Promise<PaginatedResponse<League>> {
  return apiGetAllPages<League>("/api/leagues");
}

// GET /api/leagues/:id wymaga autoryzacji (uprawnienie "leagues"),
// więc ligę wybieramy z publicznej listy GET /api/leagues
export async function getLeagueById(leagueId: number): Promise<League> {
  const { data } = await getLeagues();
  const league = data.find(l => l.id === leagueId);
  if (!league) throw new Error(`League id=${leagueId} not found`);
  return league;
}
