import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { AuthService } from "../../core/auth.service";
import { isBlank, REQUIRED_FIELD_MESSAGE } from "../../shared/app.shared";
import {
  FieldComponent,
  InlineErrorComponent
} from "../../shared/ui.components";
import { AuthFormState } from "./auth-form-state";

@Component({
  selector: "rr-login-form",
  standalone: true,
  imports: [FormsModule, FieldComponent, InlineErrorComponent],
  template: `
    <form class="auth-form" (ngSubmit)="submit()">
      <rr-field
        [error]="fieldError('username')"
        errorId="login-username-error"
        label="Username"
      >
        <input
          aria-label="Username"
          autoComplete="username"
          [attr.aria-describedby]="
            hasFieldError('username') ? 'login-username-error' : null
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
        errorId="login-password-error"
        label="Password"
      >
        <input
          autoComplete="current-password"
          [attr.aria-describedby]="
            hasFieldError('password') ? 'login-password-error' : null
          "
          [attr.aria-invalid]="hasFieldError('password') ? 'true' : null"
          [(ngModel)]="password"
          (ngModelChange)="clearFieldError('password', $event)"
          name="password"
          placeholder="Password"
          required
          type="password"
        />
      </rr-field>
      @if (error) {
        <rr-inline-error [message]="error" />
      }
      @if (notice()) {
        <div class="inline-info" role="status">{{ notice() }}</div>
      }
      <button
        aria-label="Accedi"
        class="button primary auth-submit"
        [disabled]="pending"
        type="submit"
      >
        {{ pending ? "Accesso..." : "Accedi" }}
      </button>
    </form>
  `
})
export class LoginFormComponent extends AuthFormState {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap
  });

  username = "";
  password = "";
  readonly notice = computed(() =>
    this.queryParamMap().get("registered") === "1"
      ? "Registrazione ricevuta. Ora puoi accedere con username e password."
      : null
  );
  private readonly returnUrl = computed(() => {
    const returnUrl = this.queryParamMap().get("returnUrl");

    return returnUrl?.startsWith("/") === true && !returnUrl.startsWith("//")
      ? returnUrl
      : "/challenges";
  });

  async submit(): Promise<void> {
    if (!this.prepareSubmission(() => this.validateFields())) {
      return;
    }

    try {
      await this.auth.login(this.username.trim(), this.password);
      await this.router.navigateByUrl(this.returnUrl());
    } catch {
      this.error = "Credenziali non valide.";
    } finally {
      this.pending = false;
    }
  }

  private validateFields(): boolean {
    const errors = new Map<string, string>();

    if (isBlank(this.username)) {
      errors.set("username", REQUIRED_FIELD_MESSAGE);
    }

    if (isBlank(this.password)) {
      errors.set("password", REQUIRED_FIELD_MESSAGE);
    }

    this.fieldErrors = errors;

    return errors.size === 0;
  }
}
