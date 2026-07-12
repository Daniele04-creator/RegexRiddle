import { AuthService } from "../../core/auth.service";
import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { LucideCircleCheck, LucideTerminal, LucideX } from "@lucide/angular";
import { LoginFormComponent } from "./login-form.component";
import { RegisterFormComponent } from "./register-form.component";

@Component({
  selector: "rr-auth-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    LoginFormComponent,
    RegisterFormComponent,
    LucideCircleCheck,
    LucideTerminal,
    LucideX
  ],
  template: `
    <section class="auth-page">
      <div class="auth-card motion-in">
        <button
          class="auth-close"
          routerLink="/"
          type="button"
          aria-label="Chiudi"
        >
          <svg lucideX aria-hidden="true" [size]="18"></svg>
        </button>
        <div class="auth-head">
          <div class="auth-icon">
            <svg lucideTerminal aria-hidden="true" [size]="22"></svg>
          </div>
          <h1>
            {{ mode() === "login" ? "Bentornato" : "Unisciti a RegexRiddle" }}
          </h1>
        </div>
        <div class="auth-tabs">
          <button
            aria-label="Apri accesso"
            [class.active]="mode() === 'login'"
            routerLink="/login"
            type="button"
          >
            Accedi
          </button>
          <button
            aria-label="Apri registrazione"
            [class.active]="mode() === 'register'"
            routerLink="/register"
            type="button"
          >
            Registrati
          </button>
        </div>

        @if (auth.user(); as user) {
          <div class="signed-card">
            <svg lucideCircleCheck class="green-text" [size]="22"></svg>
            <p>Hai effettuato l'accesso come @{{ user.username }}.</p>
            <a class="button primary" routerLink="/challenges"
              >Sfoglia le sfide</a
            >
          </div>
        } @else if (mode() === "login") {
          <rr-login-form />
        } @else {
          <rr-register-form />
        }
      </div>
    </section>
  `
})
export class AuthPageComponent {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data
  });

  readonly mode = computed<"login" | "register">(() =>
    this.routeData()["mode"] === "register" ? "register" : "login"
  );
}
