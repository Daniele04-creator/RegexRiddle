import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, LogInIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { routePaths } from "@/app/router";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/queries";
import {
  loginFormSchema,
  mapLoginFormToInput,
  type LoginFormValues
} from "@/features/auth/schemas";
import { ApiClientError } from "@/lib/api-client";

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 401) {
    return "Credenziali non valide.";
  }

  if (error instanceof ApiClientError && error.status === 400) {
    return "Controlla i campi e riprova.";
  }

  return "Login non disponibile. Riprova tra poco.";
}

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<LoginFormValues>({
    defaultValues: {
      password: "",
      usernameOrEmail: ""
    },
    resolver: zodResolver(loginFormSchema)
  });
  const isPending = loginMutation.isPending;
  const usernameError = errors.usernameOrEmail?.message;
  const passwordError = errors.password?.message;

  function onSubmit(values: LoginFormValues) {
    setFormError(null);

    loginMutation.mutate(mapLoginFormToInput(values), {
      onError: (error) => {
        setFormError(loginErrorMessage(error));
      },
      onSuccess: () => {
        navigate(routePaths.challenges);
      }
    });
  }

  return (
    <Card className="max-w-xl bg-card/88">
      <CardHeader>
        <CardTitle>Accedi</CardTitle>
        <CardDescription>
          Usa username o email. La sessione resta in un cookie HttpOnly gestito
          dal backend.
        </CardDescription>
      </CardHeader>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-5">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden="true" />
              <AlertTitle>Accesso non riuscito</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <FieldGroup>
            <Field data-invalid={usernameError ? "true" : undefined}>
              <FieldLabel htmlFor="login-username-or-email">
                Username o email
              </FieldLabel>
              <Input
                autoComplete="username"
                id="login-username-or-email"
                placeholder="demo_player…"
                spellCheck={false}
                {...register("usernameOrEmail")}
                aria-describedby={
                  usernameError ? "login-username-or-email-error" : undefined
                }
                aria-invalid={Boolean(usernameError)}
                disabled={isPending}
              />
              <FieldError id="login-username-or-email-error">
                {usernameError}
              </FieldError>
            </Field>

            <Field data-invalid={passwordError ? "true" : undefined}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                autoComplete="current-password"
                id="login-password"
                placeholder="Password123!…"
                type="password"
                {...register("password")}
                aria-describedby={passwordError ? "login-password-error" : undefined}
                aria-invalid={Boolean(passwordError)}
                disabled={isPending}
              />
              <FieldDescription>
                Non viene salvata nel browser e non finisce nell'URL.
              </FieldDescription>
              <FieldError id="login-password-error">{passwordError}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={isPending} type="submit">
            <LogInIcon aria-hidden="true" data-icon="inline-start" />
            {isPending ? "Accesso in corso…" : "Accedi"}
          </Button>
          <Button asChild variant="link">
            <Link to={routePaths.register}>Crea un account</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
