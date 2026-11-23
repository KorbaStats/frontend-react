import { describe, expect, it } from "vitest";
import type { League } from "@/data/types";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import { getPermissionLabel } from "@/lib/permissionLabels";
import { getTeamShortName } from "@/lib/teamLabel";

const league = (country: string | null) => ({ country }) as League;

describe("getTeamShortName", () => {
  it("używa skrótu drużyny z bazy", () => {
    expect(getTeamShortName({ name: "Legia Warszawa", short_name: "LEG" })).toBe("LEG");
  });

  it("bez skrótu bierze 3 pierwsze litery nazwy", () => {
    expect(getTeamShortName({ name: "Cracovia", short_name: null })).toBe("CRA");
  });
});

describe("getLeagueCountryCode", () => {
  it("zamienia znane kraje na kody", () => {
    expect(getLeagueCountryCode(league("Poland"))).toBe("POL");
    expect(getLeagueCountryCode(league("Germany"))).toBe("GER");
  });

  it("dla nieznanego kraju bierze 3 pierwsze litery", () => {
    expect(getLeagueCountryCode(league("Italy"))).toBe("ITA");
  });

  it("bez kraju zwraca pusty tekst", () => {
    expect(getLeagueCountryCode(league(null))).toBe("");
  });
});

describe("getPermissionLabel", () => {
  it("tłumaczy nazwę uprawnienia na polski", () => {
    expect(getPermissionLabel("users")).toBe("Użytkownicy");
    expect(getPermissionLabel("weather")).toBe("Pogoda");
  });

  it("nieznane uprawnienie zostawia bez zmian", () => {
    expect(getPermissionLabel("reports")).toBe("reports");
  });
});
