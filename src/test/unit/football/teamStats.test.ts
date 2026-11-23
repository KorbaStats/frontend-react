import { describe, expect, it } from "vitest";
import { computeTeamStats, getMatchFromTeamPerspective } from "@/lib/teamStats";
import { makeMatch } from "@/test/factories";

const statMatch = (homeGoals: number, awayGoals: number) =>
  makeMatch({
    home_team_id: 1,
    away_team_id: 2,
    home_goals: homeGoals,
    away_goals: awayGoals,
    home_expected_goals_xg: 1.5,
    away_expected_goals_xg: 0.5,
    home_total_shots: 12,
    away_total_shots: 6,
    home_shots_on_target: 5,
    away_shots_on_target: 2,
    home_ball_possession: 60,
    away_ball_possession: 40,
    home_yellow_cards: 1,
    away_yellow_cards: 3,
    home_fouls: 10,
    away_fouls: 14,
  });

describe("getMatchFromTeamPerspective", () => {
  it("bierze statystyki gospodarza, gdy drużyna gra u siebie", () => {
    expect(getMatchFromTeamPerspective(statMatch(2, 1), 1)).toEqual({
      goalsFor: 2,
      goalsAgainst: 1,
      xg: 1.5,
      shots: 12,
      shotsOnTarget: 5,
      possession: 60,
      yellowCards: 1,
      fouls: 10,
      result: "W",
    });
  });

  it("bierze statystyki gościa, gdy drużyna gra na wyjeździe", () => {
    const view = getMatchFromTeamPerspective(statMatch(2, 1), 2);
    expect(view).toMatchObject({ goalsFor: 1, goalsAgainst: 2, xg: 0.5, possession: 40, result: "L" });
  });

  it("rozpoznaje remis", () => {
    expect(getMatchFromTeamPerspective(statMatch(1, 1), 1).result).toBe("D");
  });
});

describe("computeTeamStats", () => {
  it("zlicza wygrane, remisy, porażki i bramki", () => {
    const stats = computeTeamStats([statMatch(2, 0), statMatch(1, 1), statMatch(0, 3)], 1);
    expect(stats).toMatchObject({
      matches: 3,
      wins: 1,
      draws: 1,
      losses: 1,
      goals_scored: 3,
      goals_conceded: 4,
    });
  });

  it("liczy średnie na mecz", () => {
    const stats = computeTeamStats([statMatch(2, 0), statMatch(0, 2)], 1);
    expect(stats.avg_goals_scored).toBe(1);
    expect(stats.avg_goals_conceded).toBe(1);
    expect(stats.avg_xg).toBe(1.5);
    expect(stats.avg_possession).toBe(60);
  });

  it("liczy procent wygranych i średnią punktów (3 za wygraną, 1 za remis)", () => {
    const stats = computeTeamStats(
      [statMatch(1, 0), statMatch(2, 1), statMatch(1, 1), statMatch(0, 1)],
      1,
    );
    expect(stats.win_rate).toBe(50);
    expect(stats.avg_points).toBe(7 / 4);
  });

  it("dla braku meczów zwraca zera i null zamiast NaN", () => {
    const stats = computeTeamStats([], 1);
    expect(stats.matches).toBe(0);
    expect(stats.avg_goals_scored).toBeNull();
    expect(stats.win_rate).toBeNull();
    expect(stats.avg_points).toBeNull();
  });
});
