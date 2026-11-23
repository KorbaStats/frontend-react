import { describe, expect, it } from "vitest";
import { polishPlural } from "@/lib/polishPlural";

const mecz = (count: number) => polishPlural(count, "mecz", "mecze", "meczów");

describe("polishPlural", () => {
  it("zwraca formę pojedynczą dla 1", () => {
    expect(mecz(1)).toBe("mecz");
  });

  it("zwraca formę „kilka” dla 2, 3 i 4", () => {
    expect(mecz(2)).toBe("mecze");
    expect(mecz(3)).toBe("mecze");
    expect(mecz(4)).toBe("mecze");
  });

  it("zwraca formę „wiele” dla 0 i od 5 do 11", () => {
    expect(mecz(0)).toBe("meczów");
    expect(mecz(5)).toBe("meczów");
    expect(mecz(11)).toBe("meczów");
  });

  it("traktuje 12, 13 i 14 jak „wiele”, mimo końcówki 2–4", () => {
    expect(mecz(12)).toBe("meczów");
    expect(mecz(13)).toBe("meczów");
    expect(mecz(14)).toBe("meczów");
  });

  it("wraca do formy „kilka” dla 22, 33 i 104", () => {
    expect(mecz(22)).toBe("mecze");
    expect(mecz(33)).toBe("mecze");
    expect(mecz(104)).toBe("mecze");
  });

  it("traktuje 21 i 112 jak „wiele”", () => {
    expect(mecz(21)).toBe("meczów");
    expect(mecz(112)).toBe("meczów");
  });
});
