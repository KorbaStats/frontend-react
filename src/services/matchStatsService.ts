import { summary } from "@/data/matchStats";
import type { MatchStatsSummary } from "@/data/types";

// GET /api/match-stats/summary
export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}
