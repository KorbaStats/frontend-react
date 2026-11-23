import { describe, expect, it } from "vitest";
import type { WeatherCategoryKey, WeatherFactorDefinitions } from "@/data/types";
import {
  categoryLabel,
  formatCategoryRange,
  formatConditions,
  rankWeatherScores,
  weatherScoreLabel,
} from "@/lib/weatherScore";
import { makeTeam, makeTeamScores } from "@/test/factories";

const COLD: WeatherCategoryKey = { factor: "temperature", category: "low" };

const teams = [1, 2, 3, 4].map((id) => makeTeam({ id, name: `Drużyna ${id}` }));

const definitions: WeatherFactorDefinitions = {
  precipitation: {
    column: "precipitation_mm",
    unit: "mm",
    categories: [
      { name: "none", label: "Brak", min: null, max: 0.5 },
      { name: "light", label: "Mały deszcz", min: 0.5, max: 2 },
      { name: "heavy", label: "Duży deszcz", min: 2, max: null },
    ],
  },
  temperature: {
    column: "temperature_c",
    unit: "°C",
    categories: [{ name: "low", label: "Niska", min: null, max: 5 }],
  },
  wind: {
    column: "wind_speed_kmh",
    unit: "km/h",
    categories: [{ name: "strong", label: "Silny", min: 25, max: null }],
  },
};

const teamIds = (ranked: ReturnType<typeof rankWeatherScores>) => ranked.map((row) => row.team.id);

describe("rankWeatherScores", () => {
  const scores = [
    makeTeamScores(1, COLD, 40, 10),
    makeTeamScores(2, COLD, 70, 10),
    makeTeamScores(3, COLD, 55, 10),
  ];

  it("sortuje od najlepszego wyniku", () => {
    expect(teamIds(rankWeatherScores(scores, teams, COLD, "best"))).toEqual([2, 3, 1]);
  });

  it("sortuje od najgorszego wyniku", () => {
    expect(teamIds(rankWeatherScores(scores, teams, COLD, "worst"))).toEqual([1, 3, 2]);
  });

  it("pomija drużyny z mniej niż 3 meczami w danej pogodzie", () => {
    const withFewMatches = [...scores, makeTeamScores(4, COLD, 95, 2)];
    expect(teamIds(rankWeatherScores(withFewMatches, teams, COLD, "best"))).not.toContain(4);
  });

  it("przy równym wyniku wyżej stawia drużynę z większą liczbą meczów", () => {
    const tied = [makeTeamScores(1, COLD, 60, 4), makeTeamScores(2, COLD, 60, 12)];
    expect(teamIds(rankWeatherScores(tied, teams, COLD, "best"))).toEqual([2, 1]);
  });

  it("przycina ranking do limitu", () => {
    expect(rankWeatherScores(scores, teams, COLD, "best", 2)).toHaveLength(2);
  });

  it("pomija drużyny bez wyniku w wybranej kategorii", () => {
    const rain: WeatherCategoryKey = { factor: "precipitation", category: "heavy" };
    expect(rankWeatherScores(scores, teams, rain, "best")).toEqual([]);
  });
});

describe("weatherScoreLabel", () => {
  it.each([
    [20, "Wyraźnie gorzej niż zwykle"],
    [34, "Wyraźnie gorzej niż zwykle"],
    [40, "Gorzej niż zwykle"],
    [50, "Pogoda nie robi różnicy"],
    [54, "Pogoda nie robi różnicy"],
    [60, "Lepiej niż zwykle"],
    [65, "Wyraźnie lepiej niż zwykle"],
  ])("wynik %i opisuje jako „%s”", (score, label) => {
    expect(weatherScoreLabel(score)).toBe(label);
  });
});

describe("formatCategoryRange", () => {
  it("formatuje przedział z obiema granicami po polsku", () => {
    expect(formatCategoryRange({ name: "light", label: "", min: 0.5, max: 2 }, "mm")).toBe("0,5–2 mm");
  });

  it("formatuje przedział bez dolnej granicy", () => {
    expect(formatCategoryRange({ name: "low", label: "", min: null, max: 5 }, "°C")).toBe("< 5 °C");
  });

  it("formatuje przedział bez górnej granicy", () => {
    expect(formatCategoryRange({ name: "strong", label: "", min: 25, max: null }, "km/h")).toBe("≥ 25 km/h");
  });
});

describe("etykiety kategorii", () => {
  it("łączy nazwę kategorii z jej zakresem", () => {
    expect(categoryLabel(definitions, COLD)).toBe("Niska (< 5 °C)");
  });

  it("bez definicji z backendu pokazuje samą nazwę czynnika", () => {
    expect(categoryLabel(undefined, COLD)).toBe("Temperatura");
  });

  it("opisuje warunki meczu i pomija brakujące czynniki", () => {
    const conditions = { precipitation: "heavy", temperature: "low", wind: null } as const;
    expect(formatConditions(definitions, conditions)).toBe("Duży deszcz · Niska");
  });
});
