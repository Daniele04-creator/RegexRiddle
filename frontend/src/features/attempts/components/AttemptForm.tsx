import type { AttemptSubmissionResponseDTO } from "@regexriddle/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, SendIcon } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { AttemptFeedbackCard } from "@/features/attempts/components/AttemptFeedbackCard";
import { RegexFlagSelector } from "@/features/attempts/components/RegexFlagSelector";
import { useSubmitAttemptMutation } from "@/features/attempts/queries";
import {
  attemptFormSchema,
  defaultAttemptFormValues,
  mapAttemptFormToInput,
  type AttemptFormValues
} from "@/features/attempts/schemas";
import { ApiClientError } from "@/lib/api-client";

function attemptErrorMessage(error: unknown, isAuthor: boolean): string {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 400:
        return "Controlla i campi e riprova.";
      case 401:
        return "Sessione richiesta. Accedi e riprova.";
      case 403:
        return isAuthor
          ? "Gli autori non possono risolvere le proprie sfide."
          : "Azione non disponibile. Ricarica la pagina e riprova.";
      case 404:
        return "Sfida non trovata.";
      case 409:
        return "Hai gia risolto questa sfida.";
      case 422:
        return "Regex non valida per questo enigma.";
      default:
        return "Tentativo non disponibile. Riprova tra poco.";
    }
  }

  return "Tentativo non disponibile. Riprova tra poco.";
}

interface AttemptFormProps {
  challengeId: string;
  isAuthor: boolean;
}

export function AttemptForm({ challengeId, isAuthor }: AttemptFormProps) {
  const submitAttemptMutation = useSubmitAttemptMutation(challengeId);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] =
    useState<AttemptSubmissionResponseDTO | null>(null);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<AttemptFormValues>({
    defaultValues: defaultAttemptFormValues,
    resolver: zodResolver(attemptFormSchema)
  });
  const patternError = errors.pattern?.message;
  const isSolved = alreadySolved || lastResponse?.solved === true;
  const isPending = submitAttemptMutation.isPending;
  const isDisabled = isPending || isSolved;

  function onSubmit(values: AttemptFormValues) {
    setFormError(null);

    submitAttemptMutation.mutate(mapAttemptFormToInput(values), {
      onError: (error) => {
        if (error instanceof ApiClientError && error.status === 409) {
          setAlreadySolved(true);
        }

        setFormError(attemptErrorMessage(error, isAuthor));
      },
      onSuccess: (response) => {
        setLastResponse(response);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-card/88">
        <CardHeader>
          <CardTitle>Scrivi la tua soluzione</CardTitle>
          <CardDescription>
            Gli esempi sono indizi pubblici. Le prove nascoste decidono se hai
            risolto l'enigma.
          </CardDescription>
        </CardHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-5">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircleIcon aria-hidden="true" />
                <AlertTitle>Tentativo non accettato</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              <Field data-invalid={patternError ? "true" : undefined}>
                <FieldLabel htmlFor="attempt-pattern">
                  Regex candidata
                </FieldLabel>
                <Textarea
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="min-h-28 resize-y font-mono text-sm break-all"
                  disabled={isDisabled}
                  id="attempt-pattern"
                  placeholder="^[A-Z]{2}-\\d{4}$…"
                  spellCheck={false}
                  {...register("pattern")}
                  aria-describedby={
                    patternError
                      ? "attempt-pattern-description attempt-pattern-error"
                      : "attempt-pattern-description"
                  }
                  aria-invalid={Boolean(patternError)}
                />
                <FieldDescription id="attempt-pattern-description">
                  Inserisci solo il pattern candidato. Deve coprire tutta la
                  stringa che vuoi riconoscere.
                </FieldDescription>
                <FieldError id="attempt-pattern-error">{patternError}</FieldError>
              </Field>

              <RegexFlagSelector disabled={isDisabled} register={register} />
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button disabled={isDisabled} type="submit">
              <SendIcon aria-hidden="true" data-icon="inline-start" />
              {isPending
                ? "Invio in corso…"
                : isSolved
                  ? "Sfida risolta"
                  : "Invia tentativo"}
            </Button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isSolved
                ? "Non servono altri tentativi per questa sfida."
                : "Dopo l'invio riceverai un indizio numerico."}
            </p>
          </CardFooter>
        </form>
      </Card>

      {lastResponse ? <AttemptFeedbackCard response={lastResponse} /> : null}
    </div>
  );
}
