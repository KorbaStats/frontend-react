import { apiGet, apiRequest } from "@/services/http";
import type {
  MatchWeatherScores,
  TeamWeatherScores,
  WeatherFactorDefinitions,
  WeatherScoresRecalculation,
} from "@/data/types";

// GET /api/weather-scores
export async function getWeatherScores(leagueId?: number): Promise<TeamWeatherScores[]> {
  return apiGet<TeamWeatherScores[]>("/api/weather-scores", { league_id: leagueId });
}

// GET /api/weather-scores/categories
export async function getWeatherScoreCategories(): Promise<WeatherFactorDefinitions> {
  return apiGet<WeatherFactorDefinitions>("/api/weather-scores/categories");
}

// GET /api/weather-scores/matches/:id
export async function getMatchWeatherScores(matchId: number): Promise<MatchWeatherScores> {
  return apiGet<MatchWeatherScores>(`/api/weather-scores/matches/${matchId}`);
}

// POST /api/weather-scores/recalculate
export async function recalculateWeatherScores(): Promise<WeatherScoresRecalculation> {
  return apiRequest<WeatherScoresRecalculation>("/api/weather-scores/recalculate", {
    method: "POST",
  });
}
