import { teams } from "@/data/teams";
import type { PaginatedResponse, Team } from "@/data/types";

// GET /api/teams
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return {
    data: teams,
    pagination: { total: teams.length, page: 1, limit: teams.length, pages: 1 },
  };
}

// GET /api/teams/:id
export async function getTeamById(id: number): Promise<Team> {
  const team = teams.find((t) => t.id === id);
  if (!team) throw new Error(`Team id=${id} not found`);
  return team;
}
