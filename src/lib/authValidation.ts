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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function getEmailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Podaj adres e-mail";
  if (!EMAIL_PATTERN.test(email)) return "Niepoprawny adres e-mail";
  return undefined;
}

export type RegisterFormValues = Credentials & { confirmPassword: string };

export function validateRegisterForm(values: RegisterFormValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = getEmailError(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) errors.password = "Podaj hasło";
  else if (values.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`;

  if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Hasła nie są takie same";

  return errors;
}

export type UserFormValues = Credentials & { isNew: boolean };

export function validateUserForm(values: UserFormValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = getEmailError(values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) {
    if (values.isNew) errors.password = "Podaj hasło";
  } else if (values.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`;

  return errors;
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
