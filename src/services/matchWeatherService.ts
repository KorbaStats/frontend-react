import { apiGet, apiRequest } from "@/services/http";
import type { WeatherFetchingStatus } from "@/data/types";

// POST /api/match-weather/run-fetching
export async function runWeatherFetching(limit?: number): Promise<void> {
  await apiRequest("/api/match-weather/run-fetching", {
    method: "POST",
    body: limit === undefined ? {} : { limit },
  });
}

// GET /api/match-weather/fetching-status
export async function getWeatherFetchingStatus(): Promise<WeatherFetchingStatus> {
  return apiGet<WeatherFetchingStatus>("/api/match-weather/fetching-status");
}
