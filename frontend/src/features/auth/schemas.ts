import { z } from "zod";

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isLowercaseUsername(value: string): boolean {
  const username = normalizeUsername(value);

  if (username.length < 3 || username.length > 32) {
    return false;
  }

  return [...username].every((char) => {
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLowercaseLetter = code >= 97 && code <= 122;

    return isDigit || isLowercaseLetter || char === "_";
  });
}

function hasLetterAndNumber(value: string): boolean {
  let hasLetter = false;
  let hasNumber = false;

  for (const char of value) {
    const code = char.charCodeAt(0);

    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      hasLetter = true;
    }

    if (code >= 48 && code <= 57) {
      hasNumber = true;
    }
  }

  return hasLetter && hasNumber;
}

export const loginFormSchema = z
  .object({
    password: z
      .string()
      .min(1, "Inserisci la password.")
      .max(128, "La password deve avere al massimo 128 caratteri."),
    usernameOrEmail: z
      .string()
      .trim()
      .min(1, "Inserisci username o email.")
      .max(254, "Username o email deve avere al massimo 254 caratteri.")
  })
  .strict();

export const registerFormSchema = z
  .object({
    confirmPassword: z.string().min(1, "Conferma la password."),
    displayName: z
      .string()
      .trim()
      .min(1, "Inserisci il nome visibile.")
      .max(80, "Il nome visibile deve avere al massimo 80 caratteri."),
    email: z
      .string()
      .trim()
      .max(254, "Email deve avere al massimo 254 caratteri.")
      .email("Inserisci una email valida."),
    password: z
      .string()
      .min(8, "La password deve avere almeno 8 caratteri.")
      .max(128, "La password deve avere al massimo 128 caratteri.")
      .refine(hasLetterAndNumber, "La password deve includere lettere e numeri."),
    username: z
      .string()
      .trim()
      .refine(
        isLowercaseUsername,
        "Username: 3-32 caratteri, lettere minuscole, numeri o underscore."
      )
  })
  .strict()
  .refine((values) => values.password === values.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"]
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function mapLoginFormToInput(values: LoginFormValues) {
  return {
    password: values.password,
    usernameOrEmail: values.usernameOrEmail.trim().toLowerCase()
  };
}

export function mapRegisterFormToInput(values: RegisterFormValues) {
  return {
    displayName: values.displayName.trim(),
    email: normalizeEmail(values.email),
    password: values.password,
    username: normalizeUsername(values.username)
  };
}
