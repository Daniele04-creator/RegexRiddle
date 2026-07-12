import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  LucideChevronDown,
  LucideCircleAlert,
  LucideCircleCheck,
  LucideTrophy
} from "@lucide/angular";
import type { AttemptResultDTO, ChallengeDetailDTO } from "@regexriddle/shared";
import { CHALLENGE_PATTERN_MAX_LENGTH } from "@regexriddle/shared";

import {
  InlineErrorComponent,
  PanelComponent
} from "../../shared/ui.components";
import {
  attemptSubmissionErrorMessage,
  ChallengeApiService,
  classifyAttemptSubmissionFailure
} from "./challenge-api.service";

interface AttemptHistoryItem extends AttemptResultDTO {
  submittedPattern: string;
}

@Component({
  selector: "rr-attempt-box",
  standalone: true,
  imports: [
    FormsModule,
    PanelComponent,
    InlineErrorComponent,
    RouterLink,
    LucideChevronDown,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideTrophy
  ],
  template: `
    @if (alreadySolved) {
      <rr-panel className="center-panel">
        <svg lucideCircleCheck class="green-text" [size]="34"></svg>
        <h2>Sfida già completata</h2>
        <p>Hai già risolto questa sfida.</p>
        <div class="center-actions">
          <a class="button primary" routerLink="/leaderboard"
            >Vedi classifica</a
          >
          <a class="button outline" routerLink="/challenges">Altre sfide</a>
        </div>
      </rr-panel>
    } @else {
      <rr-panel title="Invia la tua regex">
        <form class="attempt-form" (ngSubmit)="submitAttempt()">
          <div class="regex-input-row">
            <label class="regex-field">
              <span>/</span>
              <input
                aria-label="Regex candidata"
                [(ngModel)]="pattern"
                [attr.maxlength]="patternMaxLength"
                name="pattern"
                placeholder="la-tua-regex"
                spellcheck="false"
              />
              <span>/</span>
            </label>
            <button
              [attr.aria-label]="solved() ? 'Sfida risolta' : 'Invia tentativo'"
              class="button primary"
              [disabled]="pending || solved()"
              type="submit"
            >
              {{
                solved() ? "Sfida risolta" : pending ? "Verifica..." : "Test"
              }}
            </button>
          </div>
          <p class="small-copy">
            Premi Invio per testare. La regex viene provata contro controlli
            nascosti sul server.
          </p>
        </form>

        @if (error) {
          <rr-inline-error [message]="error" />
        }
        @if (solved()) {
          <div class="attempt-result solved motion-in">
            <div class="result-title">
              <svg lucideTrophy [size]="17"></svg>
              Soluzione corretta
            </div>
            <p class="small-copy">Hai risolto la sfida.</p>
          </div>
        }
        @if (history.length > 0) {
          <div class="attempt-history">
            <h3>I tuoi tentativi ({{ history.length }})</h3>
            @for (item of history; track item.id) {
              <details
                [class]="
                  item.isCorrect ? 'attempt-card solved' : 'attempt-card'
                "
                open
              >
                <summary class="attempt-card-summary">
                  <span class="attempt-card-title">
                    @if (item.isCorrect) {
                      <svg
                        lucideCircleCheck
                        class="green-text"
                        [size]="16"
                      ></svg>
                    } @else {
                      <svg
                        lucideCircleAlert
                        class="amber-text"
                        [size]="16"
                      ></svg>
                    }
                    <span>
                      {{
                        item.isCorrect
                          ? "Risolta al tentativo #" + item.attemptNumber
                          : "Tentativo #" + item.attemptNumber
                      }}
                    </span>
                  </span>
                  <span
                    class="attempt-card-status"
                    aria-label="Dettagli tentativo"
                  >
                    @if (item.isCorrect) {
                      <span>Completata</span>
                    }
                    <svg lucideChevronDown aria-hidden="true" [size]="15"></svg>
                  </span>
                </summary>
                <div class="attempt-card-body">
                  <div class="attempt-regex-row">
                    <span>Regex inviata</span>
                    <code
                      >/{{
                        item.submittedPattern.length > 0
                          ? item.submittedPattern
                          : "(vuota)"
                      }}/</code
                    >
                  </div>
                  <div class="attempt-breakdown">
                    <div>
                      <span>Controlli positivi presi</span>
                      <strong
                        >{{ item.positiveMatched }}/{{
                          item.positiveTotal
                        }}</strong
                      >
                    </div>
                    <div>
                      <span>Controlli negativi presi</span>
                      <strong
                        >{{ negativeRejected(item) }}/{{
                          item.negativeTotal
                        }}</strong
                      >
                    </div>
                  </div>
                </div>
              </details>
            }
          </div>
        }
      </rr-panel>
    }
  `
})
export class AttemptBoxComponent {
  @Input({ required: true }) challenge!: ChallengeDetailDTO;
  @Output() unauthorized = new EventEmitter<void>();

  private readonly challengeApi = inject(ChallengeApiService);

  pattern = "";
  result: AttemptResultDTO | null = null;
  history: AttemptHistoryItem[] = [];
  error: string | null = null;
  alreadySolved = false;
  pending = false;
  readonly patternMaxLength = CHALLENGE_PATTERN_MAX_LENGTH;

  solved(): boolean {
    return this.result?.isCorrect === true;
  }

  negativeRejected(result: AttemptResultDTO): number {
    return Math.max(0, result.negativeTotal - result.negativeMatched);
  }

  async submitAttempt(): Promise<void> {
    if (this.pending || this.solved()) {
      return;
    }

    this.error = null;
    this.pending = true;

    try {
      const submittedPattern = this.pattern;
      const response = await this.challengeApi.submitAttempt(
        this.challenge.id,
        submittedPattern
      );
      this.result = response.attempt;
      this.history = [
        {
          ...response.attempt,
          submittedPattern
        },
        ...this.history
      ].slice(0, 10);
    } catch (caught) {
      this.handleSubmissionFailure(caught);
    } finally {
      this.pending = false;
    }
  }

  private handleSubmissionFailure(caught: unknown): void {
    const failure = classifyAttemptSubmissionFailure(caught);

    if (failure === "unauthorized") {
      this.unauthorized.emit();
      return;
    }

    if (failure === "already_solved") {
      this.alreadySolved = true;
      return;
    }

    this.error = attemptSubmissionErrorMessage(failure);
  }
}
