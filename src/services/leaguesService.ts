import { leagues } from "@/data/leagues";
import type { LeagueWithFlag } from "@/data/leagues";

export async function getLeagues(): Promise<LeagueWithFlag[]> {
  return leagues;
}