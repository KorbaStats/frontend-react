import { describe, expect, it } from "vitest";
import {
  computeOutcomeSplit,
  hasExpectedGoals,
  impliedShares,
  matchOdds,
} from "@/lib/matchOutcomes";
import { makeMatch } from "@/test/factories";

describe("computeOutcomeSplit", () => {
  it("liczy wygrane gospodarzy, remisy i wygrane gości", () => {
    const matches = [
      makeMatch({ home_goals: 2, away_goals: 0 }),
      makeMatch({ home_goals: 3, away_goals: 1 }),
      makeMatch({ home_goals: 1, away_goals: 1 }),
      makeMatch({ home_goals: 0, away_goals: 2 }),
    ];

    expect(computeOutcomeSplit(matches)).toEqual({
      homeWins: 2,
      draws: 1,
      awayWins: 1,
      matches: 4,
    });
  });

  it("zwraca zera dla pustej listy", () => {
    expect(computeOutcomeSplit([])).toEqual({ homeWins: 0, draws: 0, awayWins: 0, matches: 0 });
  });
});

describe("matchOdds", () => {
  it("zwraca kursy, gdy są wszystkie trzy", () => {
    const match = makeMatch({ home_win_odds: 2, draw_odds: 3.5, away_win_odds: 4 });
    expect(matchOdds(match)).toEqual({ home: 2, draw: 3.5, away: 4 });
  });

  it("zwraca null, gdy brakuje któregoś kursu", () => {
    expect(matchOdds(makeMatch({ home_win_odds: 2, draw_odds: null, away_win_odds: 4 }))).toBeNull();
  });
});

describe("impliedShares", () => {
  it("zamienia kursy na procenty sumujące się do 100", () => {
    const shares = impliedShares({ home: 1.8, draw: 3.6, away: 4.5 });
    expect(shares.home + shares.draw + shares.away).toBeCloseTo(100);
  });

  it("daje po 1/3 przy równych kursach", () => {
    const shares = impliedShares({ home: 3, draw: 3, away: 3 });
    expect(shares.home).toBeCloseTo(100 / 3);
    expect(shares.draw).toBeCloseTo(100 / 3);
    expect(shares.away).toBeCloseTo(100 / 3);
  });

  it("daje faworytowi (niższy kurs) większy udział", () => {
    const shares = impliedShares({ home: 1.5, draw: 4, away: 6 });
    expect(shares.home).toBeGreaterThan(shares.draw);
    expect(shares.draw).toBeGreaterThan(shares.away);
  });
});

describe("hasExpectedGoals", () => {
  it("wymaga xG obu drużyn", () => {
    expect(hasExpectedGoals(makeMatch({ home_expected_goals_xg: 1.2, away_expected_goals_xg: 0.4 }))).toBe(true);
    expect(
      hasExpectedGoals(makeMatch({ home_expected_goals_xg: 1.2, away_expected_goals_xg: null as unknown as number })),
    ).toBe(false);
  });
});
