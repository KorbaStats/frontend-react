// Odwzorowuje MatchStatsController (GET /api/match-stats/*) — wyłącznie
// prawdziwe, zaimplementowane endpointy. Każda funkcja tutaj ma odpowiednik
// 1:1 w backendzie.
//
// Agregaty pogodowe kiedyś mieszkały w tym pliku; nie mają żadnego odpowiednika
// w backendzie i siedzą teraz w weatherStatsService.ts.

import { summary } from "@/data/matchStats";
import type { MatchStatsSummary } from "@/data/types";

/**
 * GET /api/match-stats/summary
 *
 * Prawdziwy endpoint przyjmuje `league_id`, `team_id`, `season`, `date_from`,
 * `date_to` (MatchStatsController._applyFilters) — `team_id` łapie gospodarza
 * ALBO gościa. Zwraca surowe wyjście knex.raw(), więc każda wartość to string.
 */
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}
