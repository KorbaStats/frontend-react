import { apiGet, apiGetAllPages, apiRequest } from "@/services/http";
import type {
  GeocodingStatus,
  PaginatedResponse,
  Stadium,
  StadiumInput,
} from "@/data/types";

// GET /api/stadiums
export async function getStadiums(): Promise<PaginatedResponse<Stadium>> {
  return apiGetAllPages<Stadium>("/api/stadiums");
}

// POST /api/stadiums
export async function createStadium(input: StadiumInput): Promise<void> {
  await apiRequest("/api/stadiums", { method: "POST", body: input });
}

// PATCH /api/stadiums/:id
export async function updateStadium(id: number, input: StadiumInput): Promise<void> {
  await apiRequest(`/api/stadiums/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/stadiums/:id
export async function deleteStadium(id: number): Promise<void> {
  await apiRequest<void>(`/api/stadiums/${id}`, { method: "DELETE" });
}

// POST /api/stadiums/run-geocoding
export async function runGeocoding(): Promise<void> {
  await apiRequest("/api/stadiums/run-geocoding", { method: "POST" });
}

// GET /api/stadiums/geocoding-status
export async function getGeocodingStatus(): Promise<GeocodingStatus> {
  return apiGet<GeocodingStatus>("/api/stadiums/geocoding-status");
}
