import { describe, expect, it } from "vitest";
import {
  emptyFilters,
  filterMatches,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  type MatchFilters,
} from "@/lib/matchFilters";
import { makeMatch, makeTeam, makeWeather } from "@/test/factories";

const ids = (matches: ReturnType<typeof filterMatches>) => matches.map((match) => match.id);
const withFilters = (overrides: Partial<MatchFilters>): MatchFilters => ({ ...emptyFilters, ...overrides });

describe("filterMatches", () => {
  it("bez filtrów zwraca wszystkie mecze", () => {
    const matches = [makeMatch({ id: 1 }), makeMatch({ id: 2 })];
    expect(filterMatches(matches, emptyFilters)).toHaveLength(2);
  });

  it("filtruje po sezonie i lidze", () => {
    const matches = [
      makeMatch({ id: 1, season: "2024/2025", league_id: 1 }),
      makeMatch({ id: 2, season: "2025/2026", league_id: 1 }),
      makeMatch({ id: 3, season: "2025/2026", league_id: 2 }),
    ];
    expect(ids(filterMatches(matches, withFilters({ season: "2025/2026" })))).toEqual([2, 3]);
    expect(ids(filterMatches(matches, withFilters({ season: "2025/2026", leagueId: 2 })))).toEqual([3]);
  });

  it("filtruje po zakresie dat włącznie z granicami", () => {
    const matches = [
      makeMatch({ id: 1, datetime: "2026-08-01T18:00:00Z" }),
      makeMatch({ id: 2, datetime: "2026-08-15T18:00:00Z" }),
      makeMatch({ id: 3, datetime: "2026-09-01T18:00:00Z" }),
    ];
    const filters = withFilters({ dateFrom: "2026-08-01", dateTo: "2026-08-15" });
    expect(ids(filterMatches(matches, filters))).toEqual([1, 2]);
  });

  it("szuka drużyny bez względu na wielkość liter i polskie znaki", () => {
    const matches = [
      makeMatch({ id: 1 }),
      makeMatch({ id: 2, awayTeam: makeTeam({ id: 3, name: "Górnik Zabrze", city: "Zabrze" }) }),
    ];
    expect(ids(filterMatches(matches, withFilters({ query: "GORNIK" })))).toEqual([2]);
  });

  it("filtruje po kategorii pogody", () => {
    const matches = [
      makeMatch({ id: 1, weather: makeWeather({ precipitation: "heavy" }) }),
      makeMatch({ id: 2, weather: makeWeather({ precipitation: "none" }) }),
    ];
    expect(ids(filterMatches(matches, withFilters({ precip: ["heavy"] })))).toEqual([1]);
  });

  it("łączy kilka kategorii tej samej osi jako „lub”", () => {
    const matches = [
      makeMatch({ id: 1, weather: makeWeather({ wind: "calm" }) }),
      makeMatch({ id: 2, weather: makeWeather({ wind: "light" }) }),
      makeMatch({ id: 3, weather: makeWeather({ wind: "strong" }) }),
    ];
    expect(ids(filterMatches(matches, withFilters({ wind: ["calm", "strong"] })))).toEqual([1, 3]);
  });

  it("odrzuca mecze bez danych pogodowych, gdy filtr pogody jest aktywny", () => {
    const matches = [makeMatch({ id: 1, weather: null })];
    expect(filterMatches(matches, withFilters({ temp: ["low"] }))).toEqual([]);
  });
});

describe("filtry w adresie URL", () => {
  it("zamiana filtrów na URL i z powrotem daje te same filtry", () => {
    const filters = withFilters({
      temp: ["low", "high"],
      wind: ["strong"],
      query: "legia",
      season: "2025/2026",
      leagueId: 3,
      dateFrom: "2026-08-01",
    });
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it("puste filtry dają pusty URL", () => {
    expect(filtersToParams(emptyFilters).toString()).toBe("");
  });

  it("odrzuca nieznane kategorie pogody z URL", () => {
    const filters = filtersFromParams(new URLSearchParams("temp=low&temp=tropikalna"));
    expect(filters.temp).toEqual(["low"]);
  });

  it("niepoprawne id ligi zamienia na „wszystkie”", () => {
    expect(filtersFromParams(new URLSearchParams("league=abc")).leagueId).toBe("all");
    expect(filtersFromParams(new URLSearchParams("league=-1")).leagueId).toBe("all");
  });
});

describe("hasActiveFilters", () => {
  it("rozpoznaje brak i obecność filtrów", () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
    expect(hasActiveFilters(withFilters({ query: "   " }))).toBe(false);
    expect(hasActiveFilters(withFilters({ precipType: ["snow"] }))).toBe(true);
    expect(hasActiveFilters(withFilters({ leagueId: 1 }))).toBe(true);
  });
});
