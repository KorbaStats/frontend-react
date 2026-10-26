import type { Stadium, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { normalize } from "@/lib/utils";

export type Usage = { teams: number; matches: number };

export function countLeagueUsage(
  leagueId: number,
  teams: Team[],
  matches: MatchWithWeather[],
): Usage {
  return {
    teams: teams.filter((team) => team.league_id === leagueId).length,
    matches: matches.filter((match) => match.league_id === leagueId).length,
  };
}

export function countTeamUsage(teamId: number, matches: MatchWithWeather[]): Usage {
  return {
    teams: 0,
    matches: matches.filter(
      (match) => match.home_team_id === teamId || match.away_team_id === teamId,
    ).length,
  };
}

export function countStadiumUsage(
  stadiumId: number,
  teams: Team[],
  matches: MatchWithWeather[],
): Usage {
  return {
    teams: teams.filter((team) => team.home_stadium_id === stadiumId).length,
    matches: matches.filter((match) => match.stadium_id === stadiumId).length,
  };
}

export function describeUsage(usage: Usage): string | null {
  const parts = [
    usage.teams > 0 && `drużyny: ${usage.teams}`,
    usage.matches > 0 && `mecze: ${usage.matches}`,
  ].filter(Boolean);
  return parts.length > 0 ? `Nie można usunąć, w użyciu (${parts.join(", ")})` : null;
}

function matchesQuery(query: string, fields: (string | null | undefined)[]): boolean {
  const normalizedQuery = normalize(query).trim();
  if (!normalizedQuery) return true;
  return fields.some((field) => normalize(field ?? "").includes(normalizedQuery));
}

export function filterTeams(teams: Team[], query: string, leagueId: number | "all"): Team[] {
  return teams.filter(
    (team) =>
      (leagueId === "all" || team.league_id === leagueId) &&
      matchesQuery(query, [team.name, team.short_name, team.city]),
  );
}

export function filterStadiums(stadiums: Stadium[], query: string): Stadium[] {
  return stadiums.filter((stadium) => matchesQuery(query, [stadium.name, stadium.city]));
}

export type AdminMatchFilters = {
  query: string;
  leagueId: number | "all";
  season: string | "all";
};

export function filterAdminMatches(
  matches: MatchWithWeather[],
  filters: AdminMatchFilters,
): MatchWithWeather[] {
  return matches.filter(
    (match) =>
      (filters.leagueId === "all" || match.league_id === filters.leagueId) &&
      (filters.season === "all" || match.season === filters.season) &&
      matchesQuery(filters.query, [match.homeTeam.name, match.awayTeam.name]),
  );
}

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

export function toNullableText(value: string): string | null {
  return value.trim() || null;
}

export function toNullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value.replace(",", "."));
  return Number.isNaN(number) ? null : number;
}

export function toInputValue(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function isInvalidNumber(value: string): boolean {
  return value.trim() !== "" && Number.isNaN(Number(value.replace(",", ".")));
}

export type SelectOption = { value: string; label: string };

export const NO_VALUE = "none";
export const ALL_VALUES = "all";

export function toIdOptions(
  items: { id: number; name: string }[],
  emptyLabel: string,
  emptyValue = NO_VALUE,
): SelectOption[] {
  return [
    { value: emptyValue, label: emptyLabel },
    ...sortByName(items).map((item) => ({ value: String(item.id), label: item.name })),
  ];
}

export function toIdValue(id: number | null | undefined, emptyValue = NO_VALUE): string {
  return id === null || id === undefined ? emptyValue : String(id);
}

export function fromIdValue(value: string): number | null {
  return value === NO_VALUE || value === ALL_VALUES ? null : Number(value);
}
