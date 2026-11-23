import { describe, expect, it } from "vitest";
import { isDifficultConditions, isDifficultWeather, isFrost } from "@/lib/weatherProfile";
import { makeWeather } from "@/test/factories";

describe("isDifficultConditions", () => {
  it("uznaje duży deszcz za trudną pogodę", () => {
    expect(isDifficultConditions({ precipitation: "heavy", temperature: "normal", wind: "calm" })).toBe(true);
  });

  it("uznaje silny wiatr za trudną pogodę", () => {
    expect(isDifficultConditions({ precipitation: "none", temperature: "normal", wind: "strong" })).toBe(true);
  });

  it("nie uznaje samego zimna ani mżawki za trudną pogodę", () => {
    expect(isDifficultConditions({ precipitation: "light", temperature: "low", wind: "light" })).toBe(false);
  });

  it("brak danych to nie trudna pogoda", () => {
    expect(isDifficultConditions({ precipitation: null, temperature: null, wind: null })).toBe(false);
  });
});

describe("isDifficultWeather", () => {
  it("korzysta z klasyfikacji meczu z backendu", () => {
    expect(isDifficultWeather(makeWeather({ difficult: true }))).toBe(true);
    expect(isDifficultWeather(makeWeather({ difficult: false }))).toBe(false);
    expect(isDifficultWeather(makeWeather({ difficult: null }))).toBe(false);
  });
});

describe("isFrost", () => {
  it("mróz to temperatura 0 °C i niższa", () => {
    expect(isFrost(0)).toBe(true);
    expect(isFrost(-3.5)).toBe(true);
    expect(isFrost(0.1)).toBe(false);
  });
});
