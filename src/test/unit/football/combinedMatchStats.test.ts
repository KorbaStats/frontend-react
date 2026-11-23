import { describe, expect, it } from "vitest";
import {
  averageCombinedStats,
  getCombinedMatchStats,
  type CombinedMatchStats,
} from "@/lib/combinedMatchStats";
import { makeMatch } from "@/test/factories";

const emptyStats: CombinedMatchStats = {
  goals: null,
  xg: null,
  shots_on_target: null,
  corner_kicks: null,
  yellow_cards: null,
  fouls: null,
  goalkeeper_saves: null,
  pass_accuracy_pct: null,
};

describe("getCombinedMatchStats", () => {
  it("sumuje statystyki obu drużyn", () => {
    const stats = getCombinedMatchStats(
      makeMatch({
        home_goals: 2,
        away_goals: 1,
        home_expected_goals_xg: 1.5,
        away_expected_goals_xg: 0.75,
        home_corner_kicks: 6,
        away_corner_kicks: 3,
      }),
    );
    expect(stats.goals).toBe(3);
    expect(stats.xg).toBe(2.25);
    expect(stats.corner_kicks).toBe(9);
  });

  it("zwraca null, gdy brakuje statystyki u obu drużyn", () => {
    expect(getCombinedMatchStats(makeMatch()).goalkeeper_saves).toBeNull();
  });

  it("liczy celność podań z sumy podań obu drużyn", () => {
    const stats = getCombinedMatchStats(
      makeMatch({
        home_passes: { pct: 90, completed: 450, total: 500 },
        away_passes: { pct: 60, completed: 150, total: 250 },
      }),
    );
    expect(stats.pass_accuracy_pct).toBe(80);
  });

  it("zwraca null dla celności podań bez danych o podaniach", () => {
    expect(getCombinedMatchStats(makeMatch()).pass_accuracy_pct).toBeNull();
  });
});

describe("averageCombinedStats", () => {
  it("liczy średnią z kilku meczów", () => {
    const average = averageCombinedStats([
      { ...emptyStats, goals: 2 },
      { ...emptyStats, goals: 4 },
    ]);
    expect(average.goals).toBe(3);
  });

  it("pomija mecze bez danej statystyki", () => {
    const average = averageCombinedStats([
      { ...emptyStats, fouls: 20 },
      { ...emptyStats, fouls: null },
    ]);
    expect(average.fouls).toBe(20);
  });

  it("zwraca null, gdy żaden mecz nie ma danej statystyki", () => {
    expect(averageCombinedStats([emptyStats, emptyStats]).xg).toBeNull();
  });
});
