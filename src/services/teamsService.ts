// Mirrors TeamsController (GET /api/teams, GET /api/teams/:id).
// Both return teams with `[league, homeStadium]` graph-fetched.

import { teams } from "@/data/teams";
import type { PaginatedResponse, Team } from "@/data/types";

/**
 * GET /api/teams — public. Supports `league_id`, `country`, plus the shared
 * pagination params (default 20 per page, sorted by `name`).
 */
export async function getTeams(): Promise<PaginatedResponse<Team>> {
  return {
    data: teams,
    pagination: { total: teams.length, page: 1, limit: teams.length, pages: 1 },
  };
}

/**
 * GET /api/teams/:id — returns 404 `{ error: "Team not found" }` when missing.
 *
 * NOTE: currently behind requireAuth + requirePermission("teams") on the
 * backend, while TeamPage is a public route. Flagged in CLAUDE.md as a gap for
 * the backend owner; the list endpoint above is already public.
 */
export async function getTeamById(id: number): Promise<Team> {
  const team = teams.find((t) => t.id === id);
  if (!team) throw new Error(`Team id=${id} not found`);
  return team;
}
