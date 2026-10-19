import { useState } from "react"
import { Link } from "react-router"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { hasFieldErrors, validateLoginForm } from "@/lib/authValidation"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, loginError, isLoggingIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validateLoginForm({ email, password })
    setFieldErrors(errors)
    if (hasFieldErrors(errors)) return

    login({ email, password })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Zaloguj się na swoje konto</CardTitle>
          <CardDescription>
            Wpisz e-mail, żeby zalogować się na swoje konto
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password !== undefined}
                />
                <FieldError>{fieldErrors.password}</FieldError>
              </Field>
              <Field>
                {loginError && !isLoggingIn && (
                  <p className="text-sm text-destructive">{loginError}</p>
                )}
                <Button type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logowanie..." : "Zaloguj się"}
                </Button>
                <FieldDescription className="text-center">
                  Nie masz konta?{" "}
                  <Link to="/register" className="underline underline-offset-4">
                    Zarejestruj się
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
