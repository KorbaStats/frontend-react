// Odwzorowuje TeamsController (GET /api/teams, GET /api/teams/:id).
// Oba zwracają drużyny z dociągniętym grafem `[league, homeStadium]`.

import { teams } from "@/data/teams";
import type { PaginatedResponse, Team } from "@/data/types";

/**
 * GET /api/teams — publiczny. Obsługuje `league_id`, `country` plus wspólne
 * parametry paginacji (domyślnie 20 na stronę, sortowane po `name`).
 */
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return {
    data: teams,
    pagination: { total: teams.length, page: 1, limit: teams.length, pages: 1 },
  };
}

/**
 * GET /api/teams/:id — przy braku zwraca 404 `{ error: "Team not found" }`.
 *
 * Na backendzie za requireAuth + requirePermission("teams"), a strona drużyny
 * jest trasą publiczną.
 */
export async function getTeamById(id: number): Promise<Team> {
  const team = teams.find((t) => t.id === id);
  if (!team) throw new Error(`Team id=${id} not found`);
  return team;
}
