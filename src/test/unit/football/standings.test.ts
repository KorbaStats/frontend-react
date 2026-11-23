import { describe, expect, it } from "vitest";
import { buildStandings } from "@/lib/standings";
import { makeMatch, makeRanking, makeTeam } from "@/test/factories";

const teams = [
  makeTeam({ id: 1, name: "Legia Warszawa" }),
  makeTeam({ id: 2, name: "Lech Poznań" }),
  makeTeam({ id: 3, name: "Raków Częstochowa" }),
];

describe("buildStandings", () => {
  it("sortuje drużyny po punktach", () => {
    const rankings = [
      makeRanking({ team_id: 1, points: 10 }),
      makeRanking({ team_id: 2, points: 15 }),
      makeRanking({ team_id: 3, points: 12 }),
    ];

    const order = buildStandings(rankings, teams, []).map((row) => row.team.id);
    expect(order).toEqual([2, 3, 1]);
  });

  it("przy równych punktach decyduje bilans bramek", () => {
    const rankings = [
      makeRanking({ team_id: 1, points: 10, goals_scored: 10, goals_conceded: 8 }),
      makeRanking({ team_id: 2, points: 10, goals_scored: 9, goals_conceded: 3 }),
    ];

    const order = buildStandings(rankings, teams, []).map((row) => row.team.id);
    expect(order).toEqual([2, 1]);
  });

  it("przy równym bilansie decyduje liczba strzelonych bramek", () => {
    const rankings = [
      makeRanking({ team_id: 1, points: 10, goals_scored: 5, goals_conceded: 3 }),
      makeRanking({ team_id: 2, points: 10, goals_scored: 8, goals_conceded: 6 }),
    ];

    const order = buildStandings(rankings, teams, []).map((row) => row.team.id);
    expect(order).toEqual([2, 1]);
  });

  it("liczy bilans bramek i przepisuje statystyki", () => {
    const rankings = [
      makeRanking({
        team_id: 1,
        matches: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        goals_scored: 9,
        goals_conceded: 4,
        points: 10,
      }),
    ];

    const [row] = buildStandings(rankings, teams, []);
    expect(row).toMatchObject({
      played: 5,
      won: 3,
      drawn: 1,
      lost: 1,
      goalsFor: 9,
      goalsAgainst: 4,
      goalDiff: 5,
      points: 10,
    });
  });

  it("pomija ranking drużyny, której nie ma na liście drużyn", () => {
    const rankings = [makeRanking({ team_id: 1 }), makeRanking({ team_id: 99 })];
    expect(buildStandings(rankings, teams, [])).toHaveLength(1);
  });

  it("wylicza formę z perspektywy gospodarza i gościa", () => {
    const matches = [
      makeMatch({ home_team_id: 1, away_team_id: 2, home_goals: 2, away_goals: 1 }),
      makeMatch({ home_team_id: 2, away_team_id: 1, home_goals: 0, away_goals: 0 }),
    ];
    const rankings = [makeRanking({ team_id: 1 }), makeRanking({ team_id: 2 })];

    const rows = buildStandings(rankings, teams, matches);
    const formOf = (id: number) => rows.find((row) => row.team.id === id)?.form;

    expect(formOf(1)).toEqual(["W", "D"]);
    expect(formOf(2)).toEqual(["L", "D"]);
  });

  it("bierze do formy tylko 5 najnowszych meczów", () => {
    const matches = [
      ...Array.from({ length: 5 }, () => makeMatch({ home_team_id: 1, home_goals: 1, away_goals: 0 })),
      makeMatch({ home_team_id: 1, home_goals: 0, away_goals: 3 }),
    ];

    const [row] = buildStandings([makeRanking({ team_id: 1 })], teams, matches);
    expect(row.form).toEqual(["W", "W", "W", "W", "W"]);
  });
});
