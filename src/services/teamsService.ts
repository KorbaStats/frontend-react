import { apiGetAllPages } from "@/services/http";
import type { PaginatedResponse, Team } from "@/data/types";

// GET /api/teams
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return apiGetAllPages<Team>("/api/teams");
}

// GET /api/teams/:id wymaga autoryzacji (uprawnienie "teams"),
// więc drużynę wybieramy z publicznej listy GET /api/teams
export async function getTeamById(id: number): Promise<Team> {
  const { data } = await getTeams();
  const team = data.find((t) => t.id === id);
  if (!team) throw new Error(`Team id=${id} not found`);
  return team;
}
