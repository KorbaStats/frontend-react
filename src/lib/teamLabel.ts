import type { Team } from "@/data/types";

// część drużyn w bazie nie ma short_name - wtedy pierwsze litery nazwy
export function getTeamShortName(team: Pick<Team, "name" | "short_name">): string {
  return team.short_name ?? team.name.slice(0, 3).toUpperCase();
}
