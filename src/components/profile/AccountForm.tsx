import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";

import type { AccountUpdate, User } from "@/data/types";
import { SESSION_KEY } from "@/hooks/useAuth";
import { updateAccount } from "@/services/authService";
import { toUserMessage } from "@/services/http";
import {
  hasFieldErrors,
  validateAccountForm,
  type AccountFieldErrors,
} from "@/lib/authValidation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface AccountFormProps {
  user: User;
}

const AccountForm = ({ user }: AccountFormProps) => {
  const queryClient = useQueryClient();

  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AccountFieldErrors>({});

  const { mutate, error, isPending, isSuccess, reset } = useMutation({
    mutationFn: (update: AccountUpdate) => updateAccount(update),
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_KEY, session.user);
      setEmail(session.user.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const errors = validateAccountForm({
      email,
      currentEmail: user.email,
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
    mutate({
      current_password: currentPassword,
      ...(emailChanged ? { email: email.trim() } : {}),
      ...(newPassword ? { new_password: newPassword } : {}),
    });
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-primary" />
          Dane logowania
        </CardTitle>
        <CardDescription>
          Zmień e-mail lub hasło. Każda zmiana wymaga podania obecnego hasła.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <Input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={fieldErrors.email !== undefined}
              />
              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="account-new-password">Nowe hasło</FieldLabel>
                <Input
                  id="account-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  aria-invalid={fieldErrors.newPassword !== undefined}
                />
                <FieldDescription>Zostaw puste, żeby nie zmieniać.</FieldDescription>
                <FieldError>{fieldErrors.newPassword}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="account-confirm-password">
                  Powtórz nowe hasło
                </FieldLabel>
                <Input
                  id="account-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={fieldErrors.confirmPassword !== undefined}
                />
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="account-current-password">
                Obecne hasło
              </FieldLabel>
              <Input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                aria-invalid={fieldErrors.currentPassword !== undefined}
              />
              <FieldError>{fieldErrors.currentPassword}</FieldError>
            </Field>

            <Field>
              {error && !isPending && (
                <p className="text-sm text-destructive">{toUserMessage(error)}</p>
              )}
              {isSuccess && (
                <p className="text-sm text-green-600 dark:text-green-500/90">
                  Zapisano zmiany.
                </p>
              )}
              <div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;
