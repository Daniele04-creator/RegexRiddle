import { Component, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideShield } from "@lucide/angular";
import type { ChallengeDetailDTO } from "@regexriddle/shared";

import { AuthService } from "../../core/auth.service";
import { loginRedirect } from "../../core/auth.guard";
import { errorMessage } from "../../core/api.service";
import {
  difficultyClass,
  difficultyLabel,
  formatDate
} from "../../shared/app.shared";
import {
  InlineErrorComponent,
  LoadingPanelComponent,
  PanelComponent
} from "../../shared/ui.components";
import { AttemptBoxComponent } from "./attempt-box.component";
import { ChallengeApiService } from "./challenge-api.service";
import { CompletedChallengeComponent } from "./completed-challenge.component";
import { ExampleRowComponent } from "./example-row.component";

@Component({
  selector: "rr-challenge-detail-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    PanelComponent,
    ExampleRowComponent,
    AttemptBoxComponent,
    CompletedChallengeComponent,
    InlineErrorComponent,
    LoadingPanelComponent,
    LucideArrowLeft,
    LucideShield
  ],
  template: `
    @if (loading()) {
      <rr-loading-panel label="Caricamento sfida..." />
    } @else if (error() || !challenge()) {
      <section class="page-narrow">
        <a class="back-link" routerLink="/challenges">
          <svg lucideArrowLeft aria-hidden="true" [size]="18"></svg>
          Torna alle sfide
        </a>
        <rr-inline-error [message]="error() ?? 'Sfida non trovata.'" />
      </section>
    } @else {
      @let currentChallenge = challenge()!;
      <section class="page-wide">
        <div class="detail-header motion-in">
          <a
            class="icon-back"
            routerLink="/challenges"
            aria-label="Torna alle sfide"
          >
            <svg lucideArrowLeft aria-hidden="true" [size]="20"></svg>
          </a>
          <div>
            <div class="detail-meta">
              <span [class]="difficultyClass(currentChallenge.difficulty)">
                {{ difficultyLabel(currentChallenge.difficulty) }}
              </span>
            </div>
            <h1>{{ currentChallenge.title }}</h1>
            <p>
              di <strong>@{{ currentChallenge.author.username }}</strong> -
              creata il
              {{ formatDate(currentChallenge.createdAt) }}
            </p>
          </div>
        </div>

        <div class="detail-main">
          <rr-panel title="Descrizione">
            <p>{{ currentChallenge.description }}</p>
          </rr-panel>
          <rr-panel title="Esempi pubblici">
            <rr-example-row
              label="Accettata (positivo)"
              tone="positive"
              [value]="currentChallenge.publicPositiveExample"
            />
            <rr-example-row
              label="Rifiutata (negativo)"
              tone="negative"
              [value]="currentChallenge.publicNegativeExample"
            />
          </rr-panel>

          @if (isAuthor()) {
            <rr-panel className="center-panel">
              <svg lucideShield class="muted-icon" [size]="30"></svg>
              <h2>Sei l'autore di questa sfida</h2>
              <p>Gli autori non possono risolvere le proprie sfide.</p>
            </rr-panel>
          } @else if (currentChallenge.viewer?.hasSolved === true) {
            <rr-completed-challenge
              [attemptsUsed]="currentChallenge.viewer?.attemptsUsed"
            />
          } @else {
            <rr-attempt-box
              [challenge]="currentChallenge"
              (unauthorized)="handleUnauthorized()"
            />
          }
        </div>
      </section>
    }
  `
})
export class ChallengeDetailPageComponent {
  readonly auth = inject(AuthService);
  private readonly challengeApi = inject(ChallengeApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });
  private activeViewerChallengeKey: string | null = null;

  readonly challenge = signal<ChallengeDetailDTO | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  difficultyLabel = difficultyLabel;
  difficultyClass = difficultyClass;
  formatDate = formatDate;

  constructor() {
    effect(() => {
      const params = this.paramMap();
      const challengeId = params.get("challengeId");

      const user = this.auth.user();

      if (user === null) {
        this.activeViewerChallengeKey = null;
        this.loading.set(false);
        return;
      }

      if (challengeId === null) {
        this.loading.set(false);
        this.error.set("ID sfida mancante.");
        return;
      }

      const viewerChallengeKey = `${user.id}:${challengeId}`;

      if (viewerChallengeKey === this.activeViewerChallengeKey) {
        return;
      }

      this.activeViewerChallengeKey = viewerChallengeKey;
      void this.load(challengeId);
    });
  }

  private async load(challengeId: string): Promise<void> {
    this.loading.set(true);
    this.challenge.set(null);
    this.error.set(null);

    try {
      this.challenge.set(await this.challengeApi.getChallenge(challengeId));
    } catch (caught) {
      this.error.set(
        errorMessage(caught, "Impossibile caricare questa sfida.")
      );
    } finally {
      this.loading.set(false);
    }
  }

  isAuthor(): boolean {
    return this.auth.user()?.username === this.challenge()?.author.username;
  }

  handleUnauthorized(): void {
    const returnUrl = this.router.url;
    this.auth.setUser(null);
    void this.router.navigateByUrl(loginRedirect(this.router, returnUrl));
  }
}
