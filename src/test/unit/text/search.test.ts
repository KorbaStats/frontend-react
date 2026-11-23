import { describe, expect, it } from "vitest";
import { filterUsersByEmail, searchTeams } from "@/lib/search";
import { makeTeam, makeUserAccount } from "@/test/factories";

const teams = [
  makeTeam({ id: 1, name: "Legia Warszawa", short_name: "LEG", city: "Warszawa" }),
  makeTeam({ id: 2, name: "Lech Poznań", short_name: "LPO", city: "Poznań" }),
  makeTeam({ id: 3, name: "Górnik Zabrze", short_name: "GOR", city: "Zabrze" }),
  makeTeam({ id: 4, name: "Polonia Warszawa", short_name: "POL", city: "Warszawa" }),
];

const names = (result: ReturnType<typeof searchTeams>) => result.map((team) => team.name);

describe("searchTeams", () => {
  it("nie szuka przy mniej niż 2 znakach", () => {
    expect(searchTeams(teams, "l")).toEqual([]);
    expect(searchTeams(teams, "  ")).toEqual([]);
  });

  it("ignoruje wielkość liter", () => {
    expect(names(searchTeams(teams, "LEGIA"))).toEqual(["Legia Warszawa"]);
  });

  it("ignoruje polskie znaki", () => {
    expect(names(searchTeams(teams, "gornik"))).toEqual(["Górnik Zabrze"]);
    expect(names(searchTeams(teams, "poznan"))).toEqual(["Lech Poznań"]);
  });

  it("szuka też po mieście", () => {
    expect(names(searchTeams(teams, "warszawa"))).toEqual(["Legia Warszawa", "Polonia Warszawa"]);
  });

  it("stawia dopasowanie od początku wyżej niż w środku", () => {
    const allTeams = [...teams, makeTeam({ id: 5, name: "Zagłębie Lubin", short_name: "ZAG", city: "Lubin" })];
    expect(names(searchTeams(allTeams, "lub"))[0]).toBe("Zagłębie Lubin");
    expect(names(searchTeams(teams, "le"))).toEqual(["Lech Poznań", "Legia Warszawa"]);
  });

  it("przycina wynik do limitu", () => {
    expect(searchTeams(teams, "wa", 1)).toHaveLength(1);
  });

  it("zwraca pustą listę, gdy nic nie pasuje", () => {
    expect(searchTeams(teams, "barcelona")).toEqual([]);
  });
});

describe("filterUsersByEmail", () => {
  const users = [
    makeUserAccount(1, "admin@admin.com"),
    makeUserAccount(2, "jan.kowalski@example.com"),
  ];

  it("zwraca wszystkich przy pustym zapytaniu", () => {
    expect(filterUsersByEmail(users, "")).toEqual(users);
  });

  it("filtruje po fragmencie e-maila bez względu na wielkość liter", () => {
    expect(filterUsersByEmail(users, "KOWALSKI").map((user) => user.id)).toEqual([2]);
  });
});
