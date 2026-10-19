import type { League } from "@/data/types";

const countryCodes: Record<string, string> = {
  Poland: "POL",
  Spain: "ESP",
  England: "ENG",
  Germany: "GER",
};

export function getLeagueCountryCode(league: League): string {
  if (!league.country) return "";
  return countryCodes[league.country] ?? league.country.slice(0, 3).toUpperCase();
}
