import { ApiService, errorMessage } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import {
  EmptyStateComponent,
  InlineErrorComponent,
  LoadingPanelComponent
} from "../../shared/ui.components";
import { Component, inject, signal } from "@angular/core";
import { LucideTrophy } from "@lucide/angular";
import {
  API_LEADERBOARD_PATH,
  type LeaderboardResponseDTO
} from "@regexriddle/shared";
import { LeaderboardTableComponent } from "./leaderboard-table.component";

@Component({
  selector: "rr-leaderboard-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    LoadingPanelComponent,
    InlineErrorComponent,
    EmptyStateComponent,
    LeaderboardTableComponent,
    LucideTrophy
  ],
  template: `
    <section class="page-board">
      <div class="leader-heading motion-in">
        <svg
          lucideTrophy
          aria-hidden="true"
          class="amber-text"
          [size]="38"
        ></svg>
        <h1>Classifica</h1>
        <p>Ordinata per sfide risolte: meno tentativi valgono di piu</p>
      </div>

      @if (loading()) {
        <rr-loading-panel label="Caricamento classifica..." />
      }
      @if (error()) {
        <rr-inline-error [message]="error()!" />
      }
      @if (data(); as leaderboard) {
        @if (leaderboard.items.length === 0) {
          <rr-empty-state text="Nessun giocatore in classifica.">
            <svg lucideTrophy aria-hidden="true" [size]="34"></svg>
          </rr-empty-state>
        } @else {
          <rr-leaderboard-table
            [currentUsername]="auth.user()?.username"
            [items]="leaderboard.items"
          />
        }
      }
    </section>
  `
})
export class LeaderboardPageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly data = signal<LeaderboardResponseDTO | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.data.set(
        await this.api.get<LeaderboardResponseDTO>(API_LEADERBOARD_PATH)
      );
    } catch (caught) {
      this.error.set(
        errorMessage(caught, "Impossibile caricare la classifica.")
      );
    } finally {
      this.loading.set(false);
    }
  }
}
