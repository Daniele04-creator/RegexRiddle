import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  hasRequiredPasswordCharacters,
  USERNAME_PATTERN
} from "@regexriddle/shared";

import { apiErrorCode, errorMessage } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { isBlank, REQUIRED_FIELD_MESSAGE } from "../../shared/app.shared";
import {
  FieldComponent,
  InlineErrorComponent
} from "../../shared/ui.components";
import { AuthFormState } from "./auth-form-state";

type RegisterField = "username" | "password";

@Component({
  selector: "rr-register-form",
  standalone: true,
  imports: [FormsModule, FieldComponent, InlineErrorComponent],
  template: `
    <form class="auth-form" (ngSubmit)="submit()">
      <rr-field
        [error]="fieldError('username')"
        errorId="register-username-error"
        label="Username"
      >
        <input
          aria-label="Username"
          autoComplete="username"
          [attr.aria-describedby]="
            hasFieldError('username') ? 'register-username-error' : null
          "
          [attr.aria-invalid]="hasFieldError('username') ? 'true' : null"
          [(ngModel)]="username"
          (ngModelChange)="clearFieldError('username', $event)"
          name="username"
          placeholder="Username"
          required
        />
      </rr-field>
      <rr-field
        [error]="fieldError('password')"
        errorId="register-password-error"
        label="Password"
      >
        <input
          autoComplete="new-password"
          [attr.aria-describedby]="
            hasFieldError('password') ? 'register-password-error' : null
          "
          [attr.aria-invalid]="hasFieldError('password') ? 'true' : null"
          [(ngModel)]="password"
          (ngModelChange)="clearFieldError('password', $event)"
          [attr.maxlength]="passwordMaxLength"
          [attr.minlength]="passwordMinLength"
          name="password"
          placeholder="Password"
          required
          type="password"
        />
      </rr-field>
      @if (error) {
        <rr-inline-error [message]="error" />
      }
      <button
        aria-label="Registrati"
        class="button primary auth-submit"
        [disabled]="pending"
        type="submit"
      >
        {{ pending ? "Creazione account..." : "Crea account" }}
      </button>
    </form>
  `
})
export class RegisterFormComponent extends AuthFormState {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = "";
  password = "";
  readonly passwordMaxLength = AUTH_PASSWORD_MAX_LENGTH;
  readonly passwordMinLength = AUTH_PASSWORD_MIN_LENGTH;

  async submit(): Promise<void> {
    if (!this.prepareSubmission(() => this.validateFields())) {
      return;
    }

    try {
      await this.auth.register(this.username.trim(), this.password);
      await this.router.navigate(["/login"], {
        queryParams: { registered: "1" }
      });
    } catch (caught) {
      const code = apiErrorCode(caught);

      if (code === "INVALID_USERNAME") {
        this.setFieldError("username", "Username non valido.");
        return;
      }

      if (code === "INVALID_PASSWORD") {
        this.setFieldError("password", "Password non valida.");
        return;
      }

      if (code === "USERNAME_IN_USE") {
        this.setFieldError("username", "Username già in uso.");
        return;
      }

      this.error = errorMessage(caught, "Impossibile creare l'account.");
    } finally {
      this.pending = false;
    }
  }

  private setFieldError(field: RegisterField, message: string): void {
    this.fieldErrors.set(field, message);
  }

  private validateFields(): boolean {
    const errors = new Map<string, string>();
    const normalizedUsername = this.username.trim().toLowerCase();

    if (isBlank(normalizedUsername)) {
      errors.set("username", REQUIRED_FIELD_MESSAGE);
    } else if (!USERNAME_PATTERN.test(normalizedUsername)) {
      errors.set(
        "username",
        "Usa 3-32 caratteri: lettere minuscole, numeri o _."
      );
    }

    if (isBlank(this.password)) {
      errors.set("password", REQUIRED_FIELD_MESSAGE);
    } else if (
      this.password.length < AUTH_PASSWORD_MIN_LENGTH ||
      this.password.length > AUTH_PASSWORD_MAX_LENGTH ||
      !hasRequiredPasswordCharacters(this.password)
    ) {
      errors.set(
        "password",
        `Usa ${AUTH_PASSWORD_MIN_LENGTH}-${AUTH_PASSWORD_MAX_LENGTH} caratteri con almeno una lettera e un numero.`
      );
    }

    this.fieldErrors = errors;

    return errors.size === 0;
  }
}
