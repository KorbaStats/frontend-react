import { Link } from "react-router"

import { cn } from "@/lib/utils"

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Hasło</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                />
                <FieldDescription>Minimum 8 znaków</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Powtórz hasło</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <Button type="submit">Zarejestruj się</Button>
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
