import { AuthService } from "./auth.service";
import { AvatarComponent } from "../shared/ui.components";
import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from "@angular/router";
import {
  LucideLogIn,
  LucideLogOut,
  LucideTerminal,
  LucideUserPlus
} from "@lucide/angular";

@Component({
  selector: "rr-app",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AvatarComponent,
    LucideLogIn,
    LucideLogOut,
    LucideTerminal,
    LucideUserPlus
  ],
  template: `
    <div class="app-shell">
      <header class="top-nav">
        <nav aria-label="Navigazione principale" class="top-nav-inner">
          <div class="brand-cluster">
            <a aria-label="RegexRiddle" class="brand-link" routerLink="/">
              <span class="brand-icon">
                <svg lucideTerminal aria-hidden="true" [size]="16"></svg>
              </span>
              <span class="brand-text">
                <span class="brand-regex">REGEX</span>
                <span class="brand-riddle">RIDDLE</span>
              </span>
            </a>
          </div>

          <div class="nav-links">
            @if (auth.user()) {
              <div class="authenticated-nav-links">
                <a routerLink="/challenges" routerLinkActive="active">Sfide</a>
                <a routerLink="/leaderboard" routerLinkActive="active"
                  >Classifica</a
                >
              </div>
            }
            <a
              class="nav-auth nav-help-link"
              routerLink="/how-it-works"
              routerLinkActive="active"
              >Come funziona</a
            >
          </div>

          <div class="nav-actions">
            @if (auth.user(); as user) {
              <a aria-label="Profilo" class="user-chip" routerLink="/account">
                <rr-avatar [user]="user" [size]="30" />
                <span>
                  <strong>@{{ user.username }}</strong>
                </span>
              </a>
              <button
                aria-label="Esci"
                class="icon-button"
                (click)="logout()"
                type="button"
              >
                <svg lucideLogOut aria-hidden="true" [size]="17"></svg>
              </button>
            } @else {
              <a class="nav-auth" routerLink="/login">
                <svg lucideLogIn aria-hidden="true" [size]="14"></svg>
                Accedi
              </a>
              <a class="button primary small" routerLink="/register">
                <svg lucideUserPlus aria-hidden="true" [size]="14"></svg>
                Registrati
              </a>
            }
          </div>
        </nav>
      </header>
      <main id="main-content">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    try {
      await this.auth.logout();
      await this.router.navigateByUrl("/");
    } catch {
      // The authenticated UI stays visible when the server rejects logout.
    }
  }
}
