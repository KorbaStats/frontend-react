// Helpery czysto prezentacyjne dla lig. Tabela `leagues` w backendzie ma
// name/country/slug i nic poza tym — żadnej flagi ani skrótu — więc każdą krótką
// etykietę trzeba wyprowadzić tutaj, zamiast wymyślać ją jako kolumnę.

import type { League } from "@/data/types";

// `slug` nie nadaje się na plakietkę ("premier-league", "laliga"), a skrócenie
// nazwy tylko powtarzałoby etykietę obok. Kraj to jedyna informacja, którą krótka
// plakietka jest w stanie dołożyć.
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
