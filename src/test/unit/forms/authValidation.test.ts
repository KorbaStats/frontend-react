import { describe, expect, it } from "vitest";
import {
  hasFieldErrors,
  validateAccountForm,
  validateLoginForm,
  validateRegisterForm,
  validateUserForm,
} from "@/lib/authValidation";

describe("validateLoginForm", () => {
  it("nie zwraca błędów dla wypełnionych pól", () => {
    expect(validateLoginForm({ email: "jan@example.com", password: "x" })).toEqual({});
  });

  it("wymaga e-maila i hasła", () => {
    expect(validateLoginForm({ email: "   ", password: "" })).toEqual({
      email: "Podaj adres e-mail",
      password: "Podaj hasło",
    });
  });
});

describe("validateRegisterForm", () => {
  const valid = {
    email: "jan@example.com",
    password: "tajnehaslo",
    confirmPassword: "tajnehaslo",
  };

  it("nie zwraca błędów dla poprawnych danych", () => {
    expect(validateRegisterForm(valid)).toEqual({});
  });

  it("odrzuca e-mail w złym formacie", () => {
    expect(validateRegisterForm({ ...valid, email: "jan@example" }).email).toBe(
      "Niepoprawny adres e-mail",
    );
  });

  it("odrzuca hasło krótsze niż 8 znaków", () => {
    const errors = validateRegisterForm({ ...valid, password: "krotkie", confirmPassword: "krotkie" });
    expect(errors.password).toBe("Hasło musi mieć co najmniej 8 znaków");
  });

  it("wykrywa różne hasła", () => {
    expect(validateRegisterForm({ ...valid, confirmPassword: "innehaslo" }).confirmPassword).toBe(
      "Hasła nie są takie same",
    );
  });
});

describe("validateUserForm", () => {
  it("wymaga hasła przy tworzeniu użytkownika", () => {
    expect(validateUserForm({ email: "jan@example.com", password: "", isNew: true })).toEqual({
      password: "Podaj hasło",
    });
  });

  it("pozwala zostawić puste hasło przy edycji", () => {
    expect(validateUserForm({ email: "jan@example.com", password: "", isNew: false })).toEqual({});
  });

  it("sprawdza długość hasła także przy edycji", () => {
    const errors = validateUserForm({ email: "jan@example.com", password: "abc", isNew: false });
    expect(errors.password).toBe("Hasło musi mieć co najmniej 8 znaków");
  });
});

describe("validateAccountForm", () => {
  const base = {
    email: "jan@example.com",
    currentEmail: "jan@example.com",
    currentPassword: "starehaslo",
    newPassword: "",
    confirmPassword: "",
  };

  it("wymaga zmiany e-maila albo nowego hasła", () => {
    expect(validateAccountForm(base).email).toBe("Zmień e-mail lub podaj nowe hasło");
  });

  it("nie uznaje zmiany samej wielkości liter za zmianę e-maila", () => {
    expect(validateAccountForm({ ...base, email: "JAN@example.com" }).email).toBe(
      "Zmień e-mail lub podaj nowe hasło",
    );
  });

  it("akceptuje samą zmianę e-maila", () => {
    expect(validateAccountForm({ ...base, email: "nowy@example.com" })).toEqual({});
  });

  it("akceptuje samą zmianę hasła", () => {
    expect(
      validateAccountForm({ ...base, newPassword: "nowehaslo", confirmPassword: "nowehaslo" }),
    ).toEqual({});
  });

  it("wymaga obecnego hasła", () => {
    const errors = validateAccountForm({ ...base, email: "nowy@example.com", currentPassword: "" });
    expect(errors.currentPassword).toBe("Podaj obecne hasło");
  });

  it("wykrywa różne nowe hasła", () => {
    const errors = validateAccountForm({ ...base, newPassword: "nowehaslo", confirmPassword: "inne" });
    expect(errors.confirmPassword).toBe("Hasła nie są takie same");
  });
});

describe("hasFieldErrors", () => {
  it("rozpoznaje pusty i niepusty obiekt błędów", () => {
    expect(hasFieldErrors({})).toBe(false);
    expect(hasFieldErrors({ email: "Podaj adres e-mail" })).toBe(true);
  });
});
