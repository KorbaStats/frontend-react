import { apiGet } from "@/services/http";
import type { TeamRanking } from "@/data/types";

// GET /api/team-stats/rankings?league_id=X&season=Y
export async function getTeamRankings(
  leagueId: number,
  season?: string,
): Promise<TeamRanking[]> {
  return apiGet<TeamRanking[]>("/api/team-stats/rankings", {
    league_id: leagueId,
    season,
  });
}
