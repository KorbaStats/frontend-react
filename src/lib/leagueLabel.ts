// Presentation-only helpers for leagues. The backend's `leagues` table has
// name/country/slug and nothing else — no flag, no abbreviation — so any short
// label has to be derived here rather than invented as a column.

import type { League } from "@/data/types";

// `slug` is unusable as a badge ("premier-league", "laliga"), and abbreviating
// the name would just repeat the label next to it. The country is the one piece
// of information a short badge can add.
const countryCodes: Record<string, string> = {
  Poland: "POL",
  Spain: "ESP",
  England: "ENG",
  Germany: "GER",
};

/** Three-letter country code for a league badge, e.g. "Premier League" → "ENG". */
export function getLeagueCountryCode(league: League): string {
  return countryCodes[league.country] ?? league.country.slice(0, 3).toUpperCase();
}
