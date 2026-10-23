import { useState } from "react"
import { Link } from "react-router"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { hasFieldErrors, validateRegisterForm } from "@/lib/authValidation"
import type { AuthFieldErrors } from "@/lib/authValidation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, registerError, isRegistering } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validateRegisterForm({ email, password, confirmPassword })
    setFieldErrors(errors)
    if (hasFieldErrors(errors)) return

    register({ email: email.trim(), password })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Utwórz konto</CardTitle>
          <CardDescription>
            Podaj e-mail i hasło, żeby utworzyć nowe konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={fieldErrors.email !== undefined}
                />
                <FieldError>{fieldErrors.email}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Hasło</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password !== undefined}
                />
                {fieldErrors.password ? (
                  <FieldError>{fieldErrors.password}</FieldError>
                ) : (
                  <FieldDescription>Minimum 8 znaków</FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Powtórz hasło</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={fieldErrors.confirmPassword !== undefined}
                />
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
              <Field>
                {registerError && !isRegistering && (
                  <p className="text-sm text-destructive">{registerError}</p>
                )}
                <Button type="submit" disabled={isRegistering}>
                  {isRegistering ? "Rejestracja..." : "Zarejestruj się"}
                </Button>
                <FieldDescription className="text-center">
                  Masz już konto?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Zaloguj się
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
