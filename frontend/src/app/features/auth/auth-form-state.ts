import { isBlank } from "../../shared/app.shared";

export class AuthFormState {
  fieldErrors = new Map<string, string>();
  error: string | null = null;
  pending = false;

  fieldError(field: string): string | undefined {
    return this.fieldErrors.get(field);
  }

  hasFieldError(field: string): boolean {
    return this.fieldErrors.has(field);
  }

  clearFieldError(field: string, value: string): void {
    if (isBlank(value) || !this.fieldErrors.has(field)) {
      return;
    }

    this.fieldErrors.delete(field);
  }

  protected prepareSubmission(validateFields: () => boolean): boolean {
    if (this.pending) {
      return false;
    }

    this.error = null;

    if (!validateFields()) {
      return false;
    }

    this.pending = true;

    return true;
  }
}
