import { apiGet, apiGetAllPages } from "@/services/http";
import type { Fixture, FixtureWeatherScoreEntry } from "@/data/types";

// GET /api/fixtures?league_id=X - nadchodzące mecze z terminarza (wszystkie strony)
export async function getUpcomingFixtures(leagueId?: number): Promise<Fixture[]> {
  const { data } = await apiGetAllPages<Fixture>("/api/fixtures", {
    league_id: leagueId,
    sort: "datetime",
    order: "asc",
  });
  return data;
}

// GET /api/fixtures/weather-scores?league_id=X - mecze w zasięgu prognozy (~2 tygodnie);
// pierwsze wywołanie pobiera prognozy z Open-Meteo, potem backend trzyma je w cache przez 3 h
export async function getUpcomingFixtureWeatherScores(
  leagueId?: number,
): Promise<FixtureWeatherScoreEntry[]> {
  return apiGet<FixtureWeatherScoreEntry[]>("/api/fixtures/weather-scores", {
    league_id: leagueId,
  });
}
