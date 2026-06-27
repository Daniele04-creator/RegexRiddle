import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, UserPlusIcon } from "lucide-react";
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
import { useRegisterMutation } from "@/features/auth/queries";
import {
  mapRegisterFormToInput,
  registerFormSchema,
  type RegisterFormValues
} from "@/features/auth/schemas";
import { ApiClientError } from "@/lib/api-client";

function registerErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 409) {
    return "Username o email gia in uso.";
  }

  if (error instanceof ApiClientError && error.status === 400) {
    return "Controlla i campi e riprova.";
  }

  return "Registrazione non disponibile. Riprova tra poco.";
}

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<RegisterFormValues>({
    defaultValues: {
      confirmPassword: "",
      displayName: "",
      email: "",
      password: "",
      username: ""
    },
    resolver: zodResolver(registerFormSchema)
  });
  const isPending = registerMutation.isPending;
  const usernameError = errors.username?.message;
  const emailError = errors.email?.message;
  const displayNameError = errors.displayName?.message;
  const passwordError = errors.password?.message;
  const confirmPasswordError = errors.confirmPassword?.message;

  function onSubmit(values: RegisterFormValues) {
    setFormError(null);

    registerMutation.mutate(mapRegisterFormToInput(values), {
      onError: (error) => {
        setFormError(registerErrorMessage(error));
      },
      onSuccess: () => {
        navigate(routePaths.challenges);
      }
    });
  }

  return (
    <Card className="max-w-2xl bg-card/88">
      <CardHeader>
        <CardTitle>Registrati</CardTitle>
        <CardDescription>
          Crea un account solver. Il backend imposta la sessione con un cookie
          HttpOnly, senza token JSON da conservare nel browser.
        </CardDescription>
      </CardHeader>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-5">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden="true" />
              <AlertTitle>Registrazione non riuscita</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={usernameError ? "true" : undefined}>
                <FieldLabel htmlFor="register-username">Username</FieldLabel>
                <Input
                  autoComplete="username"
                  id="register-username"
                  placeholder="student_demo…"
                  spellCheck={false}
                  {...register("username")}
                  aria-describedby={
                    usernameError ? "register-username-error" : undefined
                  }
                  aria-invalid={Boolean(usernameError)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Minuscole, numeri o underscore. Normalizzato prima dell'invio.
                </FieldDescription>
                <FieldError id="register-username-error">
                  {usernameError}
                </FieldError>
              </Field>

              <Field data-invalid={emailError ? "true" : undefined}>
                <FieldLabel htmlFor="register-email">Email</FieldLabel>
                <Input
                  autoComplete="email"
                  id="register-email"
                  placeholder="student_demo@example.test…"
                  spellCheck={false}
                  type="email"
                  {...register("email")}
                  aria-describedby={emailError ? "register-email-error" : undefined}
                  aria-invalid={Boolean(emailError)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Usata solo dalle API auth; non viene mostrata nella header.
                </FieldDescription>
                <FieldError id="register-email-error">{emailError}</FieldError>
              </Field>
            </div>

            <Field data-invalid={displayNameError ? "true" : undefined}>
              <FieldLabel htmlFor="register-display-name">Nome visibile</FieldLabel>
              <Input
                autoComplete="name"
                id="register-display-name"
                placeholder="Student Demo…"
                {...register("displayName")}
                aria-describedby={
                  displayNameError ? "register-display-name-error" : undefined
                }
                aria-invalid={Boolean(displayNameError)}
                disabled={isPending}
              />
              <FieldError id="register-display-name-error">
                {displayNameError}
              </FieldError>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field data-invalid={passwordError ? "true" : undefined}>
                <FieldLabel htmlFor="register-password">Password</FieldLabel>
                <Input
                  autoComplete="new-password"
                  id="register-password"
                  type="password"
                  {...register("password")}
                  aria-describedby={
                    passwordError ? "register-password-error" : undefined
                  }
                  aria-invalid={Boolean(passwordError)}
                  disabled={isPending}
                />
                <FieldDescription>
                  8-128 caratteri, almeno una lettera e un numero.
                </FieldDescription>
                <FieldError id="register-password-error">
                  {passwordError}
                </FieldError>
              </Field>

              <Field data-invalid={confirmPasswordError ? "true" : undefined}>
                <FieldLabel htmlFor="register-confirm-password">
                  Conferma password
                </FieldLabel>
                <Input
                  autoComplete="new-password"
                  id="register-confirm-password"
                  type="password"
                  {...register("confirmPassword")}
                  aria-describedby={
                    confirmPasswordError
                      ? "register-confirm-password-error"
                      : undefined
                  }
                  aria-invalid={Boolean(confirmPasswordError)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Campo solo frontend: non viene mandato al backend.
                </FieldDescription>
                <FieldError id="register-confirm-password-error">
                  {confirmPasswordError}
                </FieldError>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={isPending} type="submit">
            <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
            {isPending ? "Creazione account…" : "Registrati"}
          </Button>
          <Button asChild variant="link">
            <Link to={routePaths.login}>Hai gia un account? Accedi</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
