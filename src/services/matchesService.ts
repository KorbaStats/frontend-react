// Odwzorowuje MatchesController (GET /api/matches, GET /api/matches/:id).
//
// Jedno zastrzeżenie co do pogody: backend nie ma jeszcze żadnych danych
// pogodowych (brak tabeli `weather`, kolumny i endpointu — zweryfikowane
// 2026-08-05). Ustalony kontrakt zakłada, że pogoda docelowo przyjdzie
// zagnieżdżona w payloadzie meczu, tak jak już przychodzą
// homeTeam/awayTeam/stadium/league przez withGraphFetched z Objection. Do tego
// czasu doklejamy ją z lokalnego mocka tutaj, w JEDNYM miejscu, żeby przejście
// na prawdziwy fetch dotknęło jednej funkcji.
//TODO: verify against real API response once the backend has weather

import { matches } from "@/data/matches";
import { weatherByMatchId } from "@/data/weather";
import type { Match, PaginatedResponse, Weather } from "@/data/types";

export type MatchWithWeather = Match & { weather: Weather | null };

function withWeather(match: Match): MatchWithWeather {
  return { ...match, weather: weatherByMatchId.get(match.id) ?? null };
}

function byNewestFirst(a: Match, b: Match): number {
  return b.datetime.localeCompare(a.datetime);
}

/**
 * GET /api/matches?sort=datetime&order=desc
 *
 * Prawdziwy endpoint jest paginowany (helpers/pagination.js: 20 na stronę,
 * maks. 100) i obsługuje `league_id`, `season`, `home_team_id`,
 * `away_team_id`, `page`, `limit`, `sort`, `order`.
 *
 * Od najnowszych to kolejność, której chce każdy widok, więc ustawiamy ją tu
 * raz, zamiast sortować w każdym miejscu wywołania. `data/matches.ts` trzyma je
 * odwrotnie (od najstarszych) — stąd jawne sortowanie.
 */
export async function getMatches(): Promise<PaginatedResponse<MatchWithWeather>> {
  const data = matches.map(withWeather).sort(byNewestFirst);

  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length, pages: 1 },
  };
}

/** GET /api/matches?sort=datetime&order=desc&limit=N */
const DEFAULT_MATCHES_LIMIT = 10;

export async function getRecentMatches(
  limit = DEFAULT_MATCHES_LIMIT,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return data.slice(0, limit);
}

/**
 * Wszystkie mecze jednej drużyny, u siebie i na wyjeździe, od najnowszych.
 *
 * UWAGA: dziś nie pokrywa tego żaden pojedynczy endpoint — GET /api/matches
 * filtruje `home_team_id` ALBO `away_team_id` osobno.
 * MatchStatsController._applyFilters ma już semantykę OR pod parametrem
 * `team_id`, więc proponowana zmiana w backendzie to przyjęcie tego samego
 * `team_id` w GET /api/matches.
 *TODO: przejść na GET /api/matches?team_id=X, gdy backend zacznie to przyjmować
 */
export async function getTeamMatches(
  teamId: number,
): Promise<MatchWithWeather[]> {
  const { data } = await getMatches();
  return data.filter(
    (m) => m.home_team_id === teamId || m.away_team_id === teamId,
  );
}

/** GET /api/matches/:id */
export async function getMatchById(id: number): Promise<MatchWithWeather> {
  const match = matches.find((m) => m.id === id);
  if (!match) throw new Error(`Match id=${id} not found`);
  return withWeather(match);
}
