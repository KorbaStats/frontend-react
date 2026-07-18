import type { MatchStatsSummary } from "@/data/types";
import { summary } from "@/data/matchStats";

export async function getMatchStatsSummary(): Promise<MatchStatsSummary> {
  return summary;
}