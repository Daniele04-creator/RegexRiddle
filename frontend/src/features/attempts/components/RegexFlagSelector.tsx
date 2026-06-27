import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field";
import type { AttemptFormValues } from "@/features/attempts/schemas";
import { cn } from "@/lib/utils";
import type { UseFormRegister } from "react-hook-form";

interface RegexFlagSelectorProps {
  disabled: boolean;
  register: UseFormRegister<AttemptFormValues>;
}

const flagOptions = [
  {
    description: "Case-insensitive matching lato server.",
    field: "flags.i",
    id: "attempt-flag-i",
    label: "i"
  },
  {
    description: "Multiline matching lato server.",
    field: "flags.m",
    id: "attempt-flag-m",
    label: "m"
  }
] as const;

export function RegexFlagSelector({
  disabled,
  register
}: RegexFlagSelectorProps) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Flag supportati</FieldLegend>
      <FieldDescription>
        Opzionali. Il backend accetta solo i flag i e m.
      </FieldDescription>
      <FieldGroup className="grid gap-3 sm:grid-cols-2" data-slot="checkbox-group">
        {flagOptions.map((option) => (
          <Field
            className="rounded-lg border bg-background/70 p-3"
            key={option.id}
            orientation="horizontal"
          >
            <input
              className={cn(
                "mt-0.5 size-4 rounded border-input accent-primary",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
              disabled={disabled}
              id={option.id}
              type="checkbox"
              {...register(option.field)}
            />
            <FieldContent>
              <FieldLabel htmlFor={option.id}>
                <FieldTitle className="font-mono">{option.label}</FieldTitle>
              </FieldLabel>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}
