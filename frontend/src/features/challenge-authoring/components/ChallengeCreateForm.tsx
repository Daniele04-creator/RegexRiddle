import type { ChallengeDetailDTO, PublicUserDTO } from "@regexriddle/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  PlusIcon,
  SaveIcon,
  ShieldCheckIcon,
  Trash2Icon
} from "lucide-react";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  type FieldErrors,
  type UseFormRegister
} from "react-hook-form";

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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChallengeCreateSuccessCard } from "@/features/challenge-authoring/components/ChallengeCreateSuccessCard";
import { useCreateChallengeMutation } from "@/features/challenge-authoring/queries";
import {
  challengeCreateFormSchema,
  defaultChallengeCreateFormValues,
  mapChallengeCreateFormToInput,
  MAX_CONTROLS_PER_KIND,
  type ChallengeCreateFormValues
} from "@/features/challenge-authoring/schemas";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const difficultyOptions = [
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" }
] as const;

type ControlFieldName = "negativeControls" | "positiveControls";
type ControlErrors = FieldErrors<ChallengeCreateFormValues>[ControlFieldName];

interface ChallengeCreateFormProps {
  currentUser: PublicUserDTO;
}

interface ControlListProps {
  append: (value: { value: string }) => void;
  disabled: boolean;
  errors: ControlErrors;
  fields: Array<{ id: string }>;
  name: ControlFieldName;
  register: UseFormRegister<ChallengeCreateFormValues>;
  remove: (index: number) => void;
  title: string;
}

function createChallengeErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 400:
        return "Controlla i campi e riprova.";
      case 401:
        return "Sessione richiesta. Accedi e riprova.";
      case 403:
        return "Operazione non autorizzata o controllo CSRF non valido.";
      case 422:
        return "La regex segreta, gli esempi pubblici o i controlli non sono coerenti con il motore RE2.";
      default:
        return "Creazione non disponibile. Riprova tra poco.";
    }
  }

  return "Creazione non disponibile. Riprova tra poco.";
}

function readArrayError(errors: ControlErrors): string | undefined {
  const candidate = errors as
    | { message?: unknown; root?: { message?: unknown } }
    | undefined;

  if (typeof candidate?.message === "string") {
    return candidate.message;
  }

  return typeof candidate?.root?.message === "string"
    ? candidate.root.message
    : undefined;
}

function readControlError(errors: ControlErrors, index: number): string | undefined {
  const candidate = errors as Array<
    { value?: { message?: unknown } } | undefined
  > | undefined;
  const message = candidate?.[index]?.value?.message;

  return typeof message === "string" ? message : undefined;
}

function ControlList({
  append,
  disabled,
  errors,
  fields,
  name,
  register,
  remove,
  title
}: ControlListProps) {
  const arrayError = readArrayError(errors);
  const isPositive = name === "positiveControls";
  const addLabel = isPositive ? "Aggiungi positivo" : "Aggiungi negativo";

  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      <FieldDescription>
        Minimo 3, massimo {MAX_CONTROLS_PER_KIND}. I valori non vengono mostrati
        ai solver.
      </FieldDescription>
      <div className="grid gap-3">
        {fields.map((field, index) => {
          const fieldId = `${name}-${index}`;
          const error = readControlError(errors, index);

          return (
            <Field data-invalid={error ? "true" : undefined} key={field.id}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <FieldLabel htmlFor={fieldId}>
                    {isPositive ? "Controllo positivo" : "Controllo negativo"}{" "}
                    {index + 1}
                  </FieldLabel>
                  <Input
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="mt-2 font-mono"
                    disabled={disabled}
                    id={fieldId}
                    spellCheck={false}
                    {...register(`${name}.${index}.value`)}
                    aria-invalid={Boolean(error)}
                  />
                </div>
                <Button
                  aria-label={`Rimuovi ${isPositive ? "controllo positivo" : "controllo negativo"} ${index + 1}`}
                  className="mt-7"
                  disabled={disabled || fields.length <= 3}
                  onClick={() => remove(index)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Trash2Icon aria-hidden="true" data-icon="inline-start" />
                </Button>
              </div>
              <FieldError>{error}</FieldError>
            </Field>
          );
        })}
      </div>
      <div>
        <Button
          disabled={disabled || fields.length >= MAX_CONTROLS_PER_KIND}
          onClick={() => append({ value: "" })}
          type="button"
          variant="outline"
        >
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          {addLabel}
        </Button>
      </div>
      <FieldError>{arrayError}</FieldError>
    </FieldSet>
  );
}

export function ChallengeCreateForm({ currentUser }: ChallengeCreateFormProps) {
  const createChallengeMutation = useCreateChallengeMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [createdChallenge, setCreatedChallenge] = useState<ChallengeDetailDTO | null>(
    null
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<ChallengeCreateFormValues>({
    defaultValues: defaultChallengeCreateFormValues,
    resolver: zodResolver(challengeCreateFormSchema)
  });
  const positiveControls = useFieldArray({
    control,
    name: "positiveControls"
  });
  const negativeControls = useFieldArray({
    control,
    name: "negativeControls"
  });
  const isPending = createChallengeMutation.isPending;

  function onSubmit(values: ChallengeCreateFormValues) {
    setFormError(null);
    setCreatedChallenge(null);

    createChallengeMutation.mutate(mapChallengeCreateFormToInput(values), {
      onError: (error) => {
        setFormError(createChallengeErrorMessage(error));
      },
      onSuccess: (challenge) => {
        setCreatedChallenge(challenge);
        reset(defaultChallengeCreateFormValues);
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        {createdChallenge ? (
          <ChallengeCreateSuccessCard challenge={createdChallenge} />
        ) : null}

        <Card className="bg-card/88">
          <CardHeader>
            <CardTitle>Editor sfida</CardTitle>
            <CardDescription>
              Compila la sfida pubblica e i controlli segreti. La coerenza regex
              viene verificata dal backend.
            </CardDescription>
          </CardHeader>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-6">
              {formError ? (
                <Alert variant="destructive">
                  <AlertCircleIcon aria-hidden="true" />
                  <AlertTitle>Sfida non creata</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <FieldGroup>
                <Field data-invalid={errors.title ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-title">Titolo</FieldLabel>
                  <Input
                    disabled={isPending}
                    id="challenge-title"
                    maxLength={100}
                    placeholder="Codice postale italiano…"
                    {...register("title")}
                    aria-invalid={Boolean(errors.title)}
                  />
                  <FieldError>{errors.title?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.description ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-description">Descrizione</FieldLabel>
                  <Textarea
                    className="min-h-28 resize-y"
                    disabled={isPending}
                    id="challenge-description"
                    maxLength={1000}
                    placeholder="Descrivi cosa deve riconoscere il solver…"
                    {...register("description")}
                    aria-invalid={Boolean(errors.description)}
                  />
                  <FieldDescription>
                    Scrivi il requisito pubblico senza svelare regex o controlli.
                  </FieldDescription>
                  <FieldError>{errors.description?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.difficulty ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-difficulty">Difficolta</FieldLabel>
                  <select
                    className={cn(
                      "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:h-8 md:px-2.5 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                    )}
                    disabled={isPending}
                    id="challenge-difficulty"
                    {...register("difficulty")}
                    aria-invalid={Boolean(errors.difficulty)}
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError>{errors.difficulty?.message}</FieldError>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field data-invalid={errors.pattern ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-secret-pattern">
                    Regex segreta
                  </FieldLabel>
                  <Textarea
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="min-h-28 resize-y font-mono text-sm break-all"
                    disabled={isPending}
                    id="challenge-secret-pattern"
                    maxLength={300}
                    placeholder="\\d{5}"
                    spellCheck={false}
                    {...register("pattern")}
                    aria-invalid={Boolean(errors.pattern)}
                  />
                  <FieldDescription>
                    Il browser non valuta questa regex. L'API la verifica con
                    RE2 e full-match semantics.
                  </FieldDescription>
                  <FieldError>{errors.pattern?.message}</FieldError>
                </Field>

                <FieldSet>
                  <FieldLegend>Flag supportati</FieldLegend>
                  <FieldDescription>
                    Sono ammessi solo i e m, inviati sempre in ordine stabile.
                  </FieldDescription>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      className="rounded-lg border bg-background/70 p-3"
                      orientation="horizontal"
                    >
                      <input
                        className="mt-0.5 size-4 rounded border-input accent-primary"
                        disabled={isPending}
                        id="challenge-flag-i"
                        type="checkbox"
                        {...register("flags.i")}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="challenge-flag-i">
                          <FieldTitle>Ignore case</FieldTitle>
                        </FieldLabel>
                        <FieldDescription>Flag `i`.</FieldDescription>
                      </FieldContent>
                    </Field>
                    <Field
                      className="rounded-lg border bg-background/70 p-3"
                      orientation="horizontal"
                    >
                      <input
                        className="mt-0.5 size-4 rounded border-input accent-primary"
                        disabled={isPending}
                        id="challenge-flag-m"
                        type="checkbox"
                        {...register("flags.m")}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="challenge-flag-m">
                          <FieldTitle>Multiline</FieldTitle>
                        </FieldLabel>
                        <FieldDescription>Flag `m`.</FieldDescription>
                      </FieldContent>
                    </Field>
                  </div>
                  <FieldError>{errors.flags?.message}</FieldError>
                </FieldSet>
              </FieldGroup>

              <FieldGroup>
                <Field data-invalid={errors.publicPositiveExample ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-public-positive">
                    Esempio pubblico positivo
                  </FieldLabel>
                  <Input
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="font-mono"
                    disabled={isPending}
                    id="challenge-public-positive"
                    maxLength={200}
                    spellCheck={false}
                    {...register("publicPositiveExample")}
                    aria-invalid={Boolean(errors.publicPositiveExample)}
                  />
                  <FieldError>{errors.publicPositiveExample?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.publicNegativeExample ? "true" : undefined}>
                  <FieldLabel htmlFor="challenge-public-negative">
                    Esempio pubblico negativo
                  </FieldLabel>
                  <Input
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="font-mono"
                    disabled={isPending}
                    id="challenge-public-negative"
                    maxLength={200}
                    spellCheck={false}
                    {...register("publicNegativeExample")}
                    aria-invalid={Boolean(errors.publicNegativeExample)}
                  />
                  <FieldError>{errors.publicNegativeExample?.message}</FieldError>
                </Field>
              </FieldGroup>

              <div className="grid gap-6 xl:grid-cols-2">
                <ControlList
                  append={positiveControls.append}
                  disabled={isPending}
                  errors={errors.positiveControls}
                  fields={positiveControls.fields}
                  name="positiveControls"
                  register={register}
                  remove={positiveControls.remove}
                  title="Controlli segreti positivi"
                />
                <ControlList
                  append={negativeControls.append}
                  disabled={isPending}
                  errors={errors.negativeControls}
                  fields={negativeControls.fields}
                  name="negativeControls"
                  register={register}
                  remove={negativeControls.remove}
                  title="Controlli segreti negativi"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button disabled={isPending} type="submit">
                <SaveIcon aria-hidden="true" data-icon="inline-start" />
                {isPending ? "Creazione in corso…" : "Crea sfida"}
              </Button>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Autore: {currentUser.displayName} (@{currentUser.username})
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      <aside className="flex flex-col gap-4">
        <Card className="bg-card/82">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon aria-hidden="true" />
              Sicurezza
            </CardTitle>
            <CardDescription>
              Nessuna preview client-side, nessun browser storage, nessun segreto
              nella risposta pubblica.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            La form invia solo il payload necessario all'endpoint protetto. Il
            backend decide se regex, esempi e controlli sono validi prima di
            salvare la sfida.
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
