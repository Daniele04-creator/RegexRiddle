import type { PublicUserDTO } from "@regexriddle/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCurrentUserMutation } from "@/features/account/queries";
import {
  accountSettingsFormSchema,
  makeAccountSettingsDefaultValues,
  mapAccountSettingsFormToInput,
  type AccountSettingsFormValues
} from "@/features/account/schemas";
import { ApiClientError } from "@/lib/api-client";

interface AccountSettingsFormProps {
  user: PublicUserDTO;
}

function accountUpdateErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 400) {
    return "Controlla i campi: il backend ha rifiutato il payload.";
  }

  if (error instanceof ApiClientError && error.status === 401) {
    return "Sessione scaduta. Accedi di nuovo e riprova.";
  }

  if (error instanceof ApiClientError && error.status === 403) {
    return "Protezione CSRF non valida. Ricarica la pagina e riprova.";
  }

  return "Impostazioni non salvate. Riprova tra poco.";
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const updateMutation = useUpdateCurrentUserMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<AccountSettingsFormValues>({
    defaultValues: makeAccountSettingsDefaultValues(user),
    resolver: zodResolver(accountSettingsFormSchema)
  });
  const isPending = updateMutation.isPending;
  const displayNameError = errors.displayName?.message;
  const bioError = errors.bio?.message;
  const avatarUrlError = errors.avatarUrl?.message;

  useEffect(() => {
    reset(makeAccountSettingsDefaultValues(user));
  }, [reset, user]);

  function onSubmit(values: AccountSettingsFormValues) {
    setFormError(null);
    setSavedMessage(null);

    updateMutation.mutate(mapAccountSettingsFormToInput(values), {
      onError: (error) => {
        setFormError(accountUpdateErrorMessage(error));
      },
      onSuccess: (updatedUser) => {
        reset(makeAccountSettingsDefaultValues(updatedUser));
        setSavedMessage("Impostazioni account aggiornate.");
      }
    });
  }

  return (
    <Card className="bg-card/88">
      <CardHeader>
        <CardTitle>Impostazioni</CardTitle>
        <CardDescription>
          Modifica solo nome visibile, bio e avatar URL. Username, email e
          password non cambiano in questo milestone.
        </CardDescription>
      </CardHeader>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-5">
          {formError ? (
            <Alert aria-live="polite" variant="destructive">
              <AlertCircleIcon aria-hidden="true" />
              <AlertTitle>Salvataggio non riuscito</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {savedMessage ? (
            <Alert aria-live="polite">
              <CheckCircle2Icon aria-hidden="true" />
              <AlertTitle>Account aggiornato</AlertTitle>
              <AlertDescription>{savedMessage}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field data-invalid={displayNameError ? "true" : undefined}>
              <FieldLabel htmlFor="account-display-name">
                Nome visibile
              </FieldLabel>
              <Input
                autoComplete="name"
                id="account-display-name"
                placeholder="Daniele Demo…"
                {...register("displayName")}
                aria-describedby={
                  displayNameError ? "account-display-name-error" : undefined
                }
                aria-invalid={Boolean(displayNameError)}
                disabled={isPending}
              />
              <FieldDescription>
                1-80 caratteri. Appare nella header e nei dati dell'utente
                corrente.
              </FieldDescription>
              <FieldError id="account-display-name-error">
                {displayNameError}
              </FieldError>
            </Field>

            <Field data-invalid={bioError ? "true" : undefined}>
              <FieldLabel htmlFor="account-bio">Bio</FieldLabel>
              <Textarea
                autoComplete="off"
                id="account-bio"
                placeholder="Mi sto preparando all'orale di Tecnologie Web…"
                rows={4}
                {...register("bio")}
                aria-describedby={bioError ? "account-bio-error" : undefined}
                aria-invalid={Boolean(bioError)}
                disabled={isPending}
              />
              <FieldDescription>
                Massimo 280 caratteri. Un campo vuoto viene salvato come null.
              </FieldDescription>
              <FieldError id="account-bio-error">{bioError}</FieldError>
            </Field>

            <Field data-invalid={avatarUrlError ? "true" : undefined}>
              <FieldLabel htmlFor="account-avatar-url">Avatar URL</FieldLabel>
              <Input
                autoComplete="off"
                id="account-avatar-url"
                inputMode="url"
                placeholder="https://example.com/avatar.png…"
                spellCheck={false}
                type="url"
                {...register("avatarUrl")}
                aria-describedby={
                  avatarUrlError ? "account-avatar-url-error" : undefined
                }
                aria-invalid={Boolean(avatarUrlError)}
                disabled={isPending}
              />
              <FieldDescription>
                Solo URL http o https. Il server salva la stringa e non scarica
                immagini esterne.
              </FieldDescription>
              <FieldError id="account-avatar-url-error">
                {avatarUrlError}
              </FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={isPending} type="submit">
            <SaveIcon aria-hidden="true" data-icon="inline-start" />
            {isPending ? "Salvataggio…" : "Salva impostazioni"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Invia solo displayName, bio e avatarUrl.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
