import { apiGetAllPages, apiRequest } from "@/services/http";
import type { PaginatedResponse, Team, TeamInput } from "@/data/types";

// GET /api/teams
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return apiGetAllPages<Team>("/api/teams");
}

// POST /api/teams
export async function createTeam(input: TeamInput): Promise<void> {
  await apiRequest("/api/teams", { method: "POST", body: input });
}

// PATCH /api/teams/:id
export async function updateTeam(id: number, input: TeamInput): Promise<void> {
  await apiRequest(`/api/teams/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/teams/:id
export async function deleteTeam(id: number): Promise<void> {
  await apiRequest<void>(`/api/teams/${id}`, { method: "DELETE" });
}
