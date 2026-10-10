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
  CHALLENGE_LIST_DEFAULT_PAGE_SIZE,
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
      @if (!loading() && !error() && data().items.length === 0) {
        <rr-empty-state text="Nessuna sfida corrisponde alla ricerca.">
          <svg lucideHash [size]="34"></svg>
        </rr-empty-state>
      }
      @if (!loading() && !error()) {
        <div class="card-grid catalog-grid">
          @for (challenge of data().items; track challenge.id) {
            <rr-challenge-card [challenge]="challenge" />
          }
        </div>
        @if (data().totalPages > 1) {
          <nav class="catalog-pagination" aria-label="Pagine delle sfide">
            <button
              class="button"
              type="button"
              [disabled]="data().page <= 1"
              (click)="setPage(data().page - 1)"
            >
              Precedente
            </button>
            <span aria-live="polite">
              Pagina {{ data().page }} di {{ data().totalPages }}
            </span>
            <button
              class="button"
              type="button"
              [disabled]="data().page >= data().totalPages"
              (click)="setPage(data().page + 1)"
            >
              Successiva
            </button>
          </nav>
        }
      }
    </section>
  `,
  styles: `
    .catalog-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }

    .catalog-pagination span {
      text-align: center;
    }

    @media (max-width: 380px) {
      .catalog-pagination span {
        order: -1;
        flex-basis: 100%;
      }
    }
  `
})
export class ChallengesPageComponent {
  private readonly api = inject(ApiService);

  readonly data = signal<ChallengeListResponseDTO>({
    items: [],
    total: 0,
    page: 1,
    pageSize: CHALLENGE_LIST_DEFAULT_PAGE_SIZE,
    totalPages: 0
  });
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
  private page = 1;

  constructor() {
    void this.loadForCurrentFilters();
  }

  private async loadForCurrentFilters(): Promise<void> {
    const parameters = new URLSearchParams({
      page: String(this.page),
      pageSize: String(CHALLENGE_LIST_DEFAULT_PAGE_SIZE)
    });

    if (this.filter !== "all") {
      parameters.set("difficulty", this.filter);
    }

    const path = `${API_CHALLENGES_PATH}?${parameters}`;

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

      this.data.set({
        items: [],
        total: 0,
        page: this.page,
        pageSize: CHALLENGE_LIST_DEFAULT_PAGE_SIZE,
        totalPages: 0
      });
      this.error.set(errorMessage(caught, "Impossibile caricare le sfide."));
    } finally {
      if (requestId === this.requestSequence) {
        this.loading.set(false);
      }
    }
  }

  setFilter(filter: DifficultyFilter): void {
    if (this.filter === filter) {
      return;
    }

    this.filter = filter;
    this.page = 1;
    void this.loadForCurrentFilters();
  }

  setPage(page: number): void {
    if (this.loading() || page < 1 || page > this.data().totalPages) {
      return;
    }

    this.page = page;
    void this.loadForCurrentFilters();
  }
}
