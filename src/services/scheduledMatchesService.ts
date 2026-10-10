import { scheduledMatches } from "@/data/scheduledMatches";
import type { ScheduledMatch } from "@/data/types";

// GET /api/scheduled-matches?team_ids=...&sort=datetime&order=asc
export async function getUpcomingMatchesForTeams(
  teamIds: number[],
): Promise<ScheduledMatch[]> {
  if (teamIds.length === 0) return [];
  return scheduledMatches
    .filter(
      (m) =>
        teamIds.includes(m.home_team_id) || teamIds.includes(m.away_team_id),
    )
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
}
