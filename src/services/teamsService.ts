import {teams} from "@/data/teams";
import type { Team } from "@/data/types";

export async function getTeamById(id: number): Promise<Team> {
  const team = teams.find((t) => t.id === id);
  if (!team) throw new Error(`Team id=${id} not found`);
  return team;
}

