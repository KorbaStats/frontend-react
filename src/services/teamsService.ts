import { apiGetAllPages } from "@/services/http";
import type { PaginatedResponse, Team } from "@/data/types";

// GET /api/teams
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return apiGetAllPages<Team>("/api/teams");
}
