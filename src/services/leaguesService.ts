import { apiGetAllPages } from "@/services/http";
import type { League, PaginatedResponse } from "@/data/types";

// GET /api/leagues
export async function getLeagues(): Promise<PaginatedResponse<League>> {
  return apiGetAllPages<League>("/api/leagues");
}
