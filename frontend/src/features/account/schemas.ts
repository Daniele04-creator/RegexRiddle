import type {
  AccountUpdateRequestDTO,
  PublicUserDTO
} from "@regexriddle/shared";
import { z } from "zod";

function nullableTrimmedString(value: string): string | null {
  const normalized = value.trim();

  return normalized.length === 0 ? null : normalized;
}

function isHttpUrl(value: string): boolean {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return true;
  }

  try {
    const url = new URL(normalized);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const accountSettingsFormSchema = z
  .object({
    avatarUrl: z
      .string()
      .refine(
        (value) => value.trim().length <= 500,
        "Avatar URL deve avere al massimo 500 caratteri."
      )
      .refine(isHttpUrl, "Usa un URL http o https valido."),
    bio: z
      .string()
      .refine(
        (value) => value.trim().length <= 280,
        "La bio deve avere al massimo 280 caratteri."
      ),
    displayName: z
      .string()
      .trim()
      .min(1, "Inserisci il nome visibile.")
      .max(80, "Il nome visibile deve avere al massimo 80 caratteri.")
  })
  .strict();

export type AccountSettingsFormValues = z.infer<
  typeof accountSettingsFormSchema
>;

export function makeAccountSettingsDefaultValues(
  user: PublicUserDTO
): AccountSettingsFormValues {
  return {
    avatarUrl: user.avatarUrl ?? "",
    bio: user.bio ?? "",
    displayName: user.displayName
  };
}

export function mapAccountSettingsFormToInput(
  values: AccountSettingsFormValues
): AccountUpdateRequestDTO {
  return {
    avatarUrl: nullableTrimmedString(values.avatarUrl),
    bio: nullableTrimmedString(values.bio),
    displayName: values.displayName.trim()
  };
}
