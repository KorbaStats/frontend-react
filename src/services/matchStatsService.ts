import { apiGet } from "@/services/api";
import type { MatchStatsSummary } from "@/data/types";

// GET /api/match-stats/summary
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return apiGet<MatchStatsSummary>("/match-stats/summary");
}
