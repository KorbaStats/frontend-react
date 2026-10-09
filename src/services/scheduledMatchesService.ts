import { scheduledMatches } from "@/data/scheduledMatches";
import type { ScheduledMatch } from "@/data/types";

// GET /api/scheduled-matches?team_ids=...&limit=...
export async function getUpcomingMatchesForTeams(
  teamIds: number[],
  limit?: number,
): Promise<ScheduledMatch[]> {
  if (teamIds.length === 0) return [];
  const data = scheduledMatches
    .filter(
      (m) =>
        teamIds.includes(m.home_team_id) || teamIds.includes(m.away_team_id),
    )
    .slice(0, limit);

  return data;
}
