// Odwzorowuje MatchStatsController (GET /api/match-stats/*). Każda funkcja ma
// odpowiednik 1:1 w backendzie. Agregaty pogodowe są w weatherStatsService.ts.

import { summary } from "@/data/matchStats";
import type { MatchStatsSummary } from "@/data/types";

/**
 * GET /api/match-stats/summary
 *
 * Przyjmuje `league_id`, `team_id`, `season`, `date_from`, `date_to`
 * (MatchStatsController._applyFilters); `team_id` łapie gospodarza albo gościa.
 * Zwraca surowe wyjście knex.raw(), więc każda wartość to string.
 */
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}
