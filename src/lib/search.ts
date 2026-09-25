import type { Team } from "@/data/types";
import { normalize } from "@/lib/utils";

// okresla priorytet wyswietlania dopasaowania
function rankTeam(team: Team, query: string): number {
  const fields = [team.name, team.short_name, team.city].map(normalize);
  if (fields.some((f) => f.startsWith(query))) return 0; // na poczatku frazy
  if (fields.some((f) => f.includes(query))) return 1; // w srodku/na koncu
  return -1;
}

export function searchTeams(teams: Team[], query: string, limit = 8): Team[] {
  const normalizedQuery = normalize(query).trim();
  if (normalizedQuery.length < 2) return [];

  return teams
    .map((team) => ({ team, rank: rankTeam(team, normalizedQuery) }))
    .filter((entry) => entry.rank >= 0)
    .sort(
      (a, b) => a.rank - b.rank || a.team.name.localeCompare(b.team.name, "pl"),
    )
    .slice(0, limit)
    .map((entry) => entry.team);
}
