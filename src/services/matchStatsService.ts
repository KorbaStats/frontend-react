import { apiGet } from "@/services/http";
import type { MatchStatsSummary } from "@/data/types";

// GET /api/match-stats/summary
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return apiGet<MatchStatsSummary>("/api/match-stats/summary");
}
