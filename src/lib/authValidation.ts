import type { Credentials } from "@/data/types";

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateLoginForm(values: Credentials): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!values.email.trim()) errors.email = "Podaj adres e-mail";
  if (!values.password) errors.password = "Podaj hasło";

  return errors;
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
