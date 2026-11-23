import { describe, expect, it } from "vitest";
import {
  ADMIN_SECTIONS,
  canAccessAdmin,
  canAccessSection,
  getAdminHome,
  hasPermission,
} from "@/lib/adminAccess";
import { makeUser } from "@/test/factories";

const usersSection = ADMIN_SECTIONS.find((section) => section.to === "/admin")!;
const dataSection = ADMIN_SECTIONS.find((section) => section.to === "/admin/data")!;

describe("hasPermission", () => {
  it("sprawdza, czy użytkownik ma dane uprawnienie", () => {
    const user = makeUser(["teams"]);
    expect(hasPermission(user, "teams")).toBe(true);
    expect(hasPermission(user, "users")).toBe(false);
  });

  it("zwraca false dla niezalogowanego", () => {
    expect(hasPermission(null, "teams")).toBe(false);
  });
});

describe("canAccessSection", () => {
  it("wystarcza jedno z uprawnień sekcji", () => {
    expect(canAccessSection(makeUser(["roles"]), usersSection)).toBe(true);
  });

  it("dopuszcza do sekcji „Dane” z uprawnieniem do jednego zasobu", () => {
    expect(canAccessSection(makeUser(["stadiums"]), dataSection)).toBe(true);
  });

  it("blokuje sekcję bez żadnego z jej uprawnień", () => {
    expect(canAccessSection(makeUser(["weather"]), usersSection)).toBe(false);
  });
});

describe("canAccessAdmin", () => {
  it("blokuje panel zwykłemu użytkownikowi bez uprawnień", () => {
    expect(canAccessAdmin(makeUser([]))).toBe(false);
  });

  it("blokuje panel niezalogowanemu", () => {
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("wpuszcza z dowolnym uprawnieniem administracyjnym", () => {
    expect(canAccessAdmin(makeUser(["fixtures"]))).toBe(true);
  });
});

describe("getAdminHome", () => {
  it("kieruje administratora na pierwszą sekcję", () => {
    const admin = makeUser(["users", "roles", "teams", "weather", "fixtures"]);
    expect(getAdminHome(admin)).toBe("/admin");
  });

  it("kieruje na pierwszą dostępną sekcję", () => {
    expect(getAdminHome(makeUser(["weather"]))).toBe("/admin/weather");
    expect(getAdminHome(makeUser(["matches", "fixtures"]))).toBe("/admin/data");
  });

  it("kieruje na stronę główną bez uprawnień", () => {
    expect(getAdminHome(makeUser([]))).toBe("/");
  });
});
