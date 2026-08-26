// Helpery prezentacyjne dla lig. Tabela `leagues` ma tylko name/country/slug,
// bez flagi i skrótu, więc krótkie etykiety powstają tutaj.

import type { League } from "@/data/types";

// `slug` nie nadaje się na plakietkę ("premier-league"), a skrót nazwy
// powtarzałby etykietę obok — zostaje kraj.
const countryCodes: Record<string, string> = {
  Poland: "POL",
  Spain: "ESP",
  England: "ENG",
  Germany: "GER",
};

/** Trzyliterowy kod kraju na plakietkę ligi, np. "Premier League" → "ENG". */
export function getLeagueCountryCode(league: League): string {
  return countryCodes[league.country] ?? league.country.slice(0, 3).toUpperCase();
}
