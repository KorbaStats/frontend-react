import { apiGetAllPages, apiRequest } from "@/services/http";
import type { League, LeagueInput, PaginatedResponse } from "@/data/types";

// GET /api/leagues
export async function getLeagues(): Promise<PaginatedResponse<League>> {
  return apiGetAllPages<League>("/api/leagues");
}

// POST /api/leagues
export async function createLeague(input: LeagueInput): Promise<void> {
  await apiRequest("/api/leagues", { method: "POST", body: input });
}

// PATCH /api/leagues/:id
export async function updateLeague(id: number, input: LeagueInput): Promise<void> {
  await apiRequest(`/api/leagues/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/leagues/:id
export async function deleteLeague(id: number): Promise<void> {
  await apiRequest<void>(`/api/leagues/${id}`, { method: "DELETE" });
}
