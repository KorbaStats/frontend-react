// Mirrors MatchStatsController (GET /api/match-stats/*) — real, implemented
// endpoints only. Every function here has a 1:1 counterpart in the backend.
//
// Weather-based aggregates used to live in this file; they have no backend
// counterpart at all and now sit in weatherStatsService.ts.

import { summary } from "@/data/matchStats";
import type { MatchStatsSummary } from "@/data/types";

/**
 * GET /api/match-stats/summary
 *
 * The real endpoint accepts `league_id`, `team_id`, `season`, `date_from`,
 * `date_to` (MatchStatsController._applyFilters) — `team_id` matches home OR
 * away. Returns raw knex.raw() output, so every value is a string.
 */
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}
