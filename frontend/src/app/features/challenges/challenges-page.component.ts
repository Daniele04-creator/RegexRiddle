import { ApiService, errorMessage } from "../../core/api.service";
import { difficultyLabel } from "../../shared/app.shared";
import {
  ChallengeCardComponent,
  EmptyStateComponent,
  InlineErrorComponent,
  LoadingPanelComponent
} from "../../shared/ui.components";
import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideHash, LucidePlus } from "@lucide/angular";
import {
  API_CHALLENGES_PATH,
  type ChallengeDifficulty,
  type ChallengeListResponseDTO
} from "@regexriddle/shared";

type DifficultyFilter = "all" | ChallengeDifficulty;

@Component({
  selector: "rr-challenges-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    ChallengeCardComponent,
    InlineErrorComponent,
    LoadingPanelComponent,
    EmptyStateComponent,
    LucideHash,
    LucidePlus
  ],
  template: `
    <section class="page-catalog">
      <div class="page-title-row">
        <div>
          <h1>Sfide</h1>
          <p>{{ data().total }} enigmi disponibili</p>
        </div>
        <a class="button primary" routerLink="/create">
          <svg lucidePlus aria-hidden="true" [size]="16"></svg>
          Nuova sfida
        </a>
      </div>

      <div class="filters-row">
        <div class="difficulty-tabs" aria-label="Filtro difficolta">
          @for (item of filterOptions; track item) {
            <button
              [class]="
                filter === item ? 'tab active ' + item.toLowerCase() : 'tab'
              "
              (click)="setFilter(item)"
              type="button"
            >
              {{ item === "all" ? "Tutte" : difficultyLabel(item) }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <rr-loading-panel label="Caricamento sfide..." />
      }
      @if (error()) {
        <rr-inline-error [message]="error()!" />
      }
      @if (!loading() && data().items.length === 0) {
        <rr-empty-state text="Nessuna sfida corrisponde alla ricerca.">
          <svg lucideHash [size]="34"></svg>
        </rr-empty-state>
      }
      <div class="card-grid catalog-grid">
        @for (challenge of data().items; track challenge.id) {
          <rr-challenge-card [challenge]="challenge" />
        }
      </div>
    </section>
  `
})
export class ChallengesPageComponent {
  private readonly api = inject(ApiService);

  readonly data = signal<ChallengeListResponseDTO>({ items: [], total: 0 });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  filter: DifficultyFilter = "all";
  filterOptions: readonly DifficultyFilter[] = [
    "all",
    "EASY",
    "MEDIUM",
    "HARD"
  ];
  difficultyLabel = difficultyLabel;
  private requestSequence = 0;

  constructor() {
    void this.loadForCurrentFilters();
  }

  private async loadForCurrentFilters(): Promise<void> {
    const path =
      this.filter === "all"
        ? API_CHALLENGES_PATH
        : `${API_CHALLENGES_PATH}?difficulty=${this.filter}`;

    const requestId = this.requestSequence + 1;
    this.requestSequence = requestId;
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.api.get<ChallengeListResponseDTO>(path);
      if (requestId !== this.requestSequence) {
        return;
      }

      this.data.set(data);
    } catch (caught) {
      if (requestId !== this.requestSequence) {
        return;
      }

      this.data.set({ items: [], total: 0 });
      this.error.set(errorMessage(caught, "Impossibile caricare le sfide."));
    } finally {
      if (requestId === this.requestSequence) {
        this.loading.set(false);
      }
    }
  }

  setFilter(filter: DifficultyFilter): void {
    this.filter = filter;
    void this.loadForCurrentFilters();
  }
}
