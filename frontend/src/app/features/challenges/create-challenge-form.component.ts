import { Component, EventEmitter, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { LucideArrowLeft } from "@lucide/angular";
import {
  CHALLENGE_DESCRIPTION_MAX_LENGTH,
  CHALLENGE_DESCRIPTION_MIN_LENGTH,
  CHALLENGE_EXAMPLE_MAX_LENGTH,
  CHALLENGE_EXAMPLE_MIN_LENGTH,
  CHALLENGE_PATTERN_MAX_LENGTH,
  CHALLENGE_PATTERN_MIN_LENGTH,
  CHALLENGE_TITLE_MAX_LENGTH,
  CHALLENGE_TITLE_MIN_LENGTH,
  type ChallengeDetailDTO,
  type ChallengeDifficulty
} from "@regexriddle/shared";

import {
  MAX_CONTROLS_PER_KIND,
  MIN_CONTROLS_PER_KIND,
  difficultyLabel
} from "../../shared/app.shared";
import type {
  ControlTone,
  CreateChallengeField
} from "../../shared/app.shared";
import {
  FieldComponent,
  InlineErrorComponent,
  PanelComponent
} from "../../shared/ui.components";
import { ControlColumnComponent } from "./control-column.component";
import {
  ChallengeApiService,
  createChallengeSubmissionMessage
} from "./challenge-api.service";
import {
  appendControlValue,
  buildCreateChallengePayload,
  clearControlError,
  createInitialControlValues,
  recalculateControlErrors,
  removeControlValue,
  replaceControlValue,
  validateCreateChallenge,
  type CreateChallengeFormState
} from "./create-challenge-form.model";

const DIFFICULTY_OPTIONS: readonly ChallengeDifficulty[] = [
  "EASY",
  "MEDIUM",
  "HARD"
];

@Component({
  selector: "rr-create-challenge-form",
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    PanelComponent,
    FieldComponent,
    ControlColumnComponent,
    InlineErrorComponent,
    LucideArrowLeft
  ],
  template: `
    <section class="page-form">
      <div class="form-heading">
        <a class="back-link" routerLink="/challenges">
          <svg lucideArrowLeft aria-hidden="true" [size]="18"></svg>
          Vedi tutte le sfide
        </a>
        <h1>Crea una sfida</h1>
        <p>Definisci un enigma regex da far risolvere agli altri.</p>
      </div>

      <form class="form-stack" noValidate (ngSubmit)="submit()">
        <rr-panel title="Informazioni base">
          <rr-field
            [error]="fieldError('title')"
            errorId="create-title-error"
            label="Titolo"
          >
            <input
              aria-label="Titolo"
              [attr.aria-describedby]="
                hasFieldError('title') ? 'create-title-error' : null
              "
              [attr.aria-invalid]="hasFieldError('title') ? 'true' : null"
              [(ngModel)]="title"
              (ngModelChange)="clearFieldError('title')"
              [attr.maxlength]="titleMaxLength"
              [attr.minlength]="titleMinLength"
              name="title"
              placeholder="es. Validatore email"
              required
            />
          </rr-field>

          <rr-field
            [error]="fieldError('description')"
            errorId="create-description-error"
            label="Descrizione"
          >
            <textarea
              aria-label="Descrizione"
              [attr.aria-describedby]="
                hasFieldError('description') ? 'create-description-error' : null
              "
              [attr.aria-invalid]="hasFieldError('description') ? 'true' : null"
              [(ngModel)]="description"
              (ngModelChange)="clearFieldError('description')"
              [attr.maxlength]="descriptionMaxLength"
              [attr.minlength]="descriptionMinLength"
              name="description"
              placeholder="Descrivi cosa deve accettare la regex..."
              required
              rows="3"
            ></textarea>
          </rr-field>

          <div class="two-cols">
            <rr-field label="Difficolta">
              <select
                aria-label="Difficolta"
                [(ngModel)]="difficulty"
                name="difficulty"
              >
                @for (option of difficultyOptions; track option) {
                  <option [value]="option">
                    {{ difficultyLabel(option) }}
                  </option>
                }
              </select>
            </rr-field>
          </div>
        </rr-panel>

        <rr-panel className="secret-panel" title="Regex segreta">
          <span panel-title-meta class="hidden-pill"
            >nascosta ai giocatori</span
          >
          <rr-field
            [error]="fieldError('secretPattern')"
            errorId="create-secret-pattern-error"
            label="La tua regex"
          >
            <span
              [class]="
                hasFieldError('secretPattern')
                  ? 'regex-field create-regex-field field-control-error'
                  : 'regex-field create-regex-field'
              "
            >
              <span>/</span>
              <input
                aria-label="Regex segreta"
                [attr.aria-describedby]="
                  hasFieldError('secretPattern')
                    ? 'create-secret-pattern-error'
                    : null
                "
                [attr.aria-invalid]="
                  hasFieldError('secretPattern') ? 'true' : null
                "
                [(ngModel)]="secretPattern"
                (ngModelChange)="clearFieldError('secretPattern')"
                [attr.maxlength]="patternMaxLength"
                [attr.minlength]="patternMinLength"
                name="hiddenPattern"
                placeholder="espressione-regex"
                required
                spellcheck="false"
              />
              <span>/</span>
            </span>
          </rr-field>
        </rr-panel>

        <rr-panel title="Esempi pubblici">
          <div class="two-cols">
            <rr-field
              [error]="fieldError('positiveExample')"
              errorId="create-positive-example-error"
              label="Esempio positivo"
              labelClassName="green-text"
            >
              <input
                aria-label="Esempio pubblico positivo"
                [attr.aria-describedby]="
                  hasFieldError('positiveExample')
                    ? 'create-positive-example-error'
                    : null
                "
                [attr.aria-invalid]="
                  hasFieldError('positiveExample') ? 'true' : null
                "
                class="mono-input"
                [(ngModel)]="positiveExample"
                (ngModelChange)="clearFieldError('positiveExample')"
                [attr.maxlength]="exampleMaxLength"
                [attr.minlength]="exampleMinLength"
                name="positiveExample"
                placeholder="Stringa accettata"
                required
              />
            </rr-field>
            <rr-field
              [error]="fieldError('negativeExample')"
              errorId="create-negative-example-error"
              label="Esempio negativo"
              labelClassName="red-text"
            >
              <input
                aria-label="Esempio pubblico negativo"
                [attr.aria-describedby]="
                  hasFieldError('negativeExample')
                    ? 'create-negative-example-error'
                    : null
                "
                [attr.aria-invalid]="
                  hasFieldError('negativeExample') ? 'true' : null
                "
                class="mono-input"
                [(ngModel)]="negativeExample"
                (ngModelChange)="clearFieldError('negativeExample')"
                [attr.maxlength]="exampleMaxLength"
                [attr.minlength]="exampleMinLength"
                name="negativeExample"
                placeholder="Stringa rifiutata"
                required
              />
            </rr-field>
          </div>
        </rr-panel>

        <rr-panel title="Stringhe di controllo">
          <span panel-title-meta class="hidden-pill"
            >nascoste ai giocatori</span
          >
          <p class="small-copy">
            Aggiungi da {{ minControls }} a {{ maxControls }} controlli positivi
            e da {{ minControls }} a {{ maxControls }} negativi.
          </p>
          <div class="two-cols controls-grid">
            <rr-control-column
              [controls]="positiveControls"
              label="Controlli positivi"
              [fieldErrors]="fieldErrors"
              tone="positive"
              (addControl)="addControl('positive')"
              (controlValueChange)="
                setControl('positive', $event.index, $event.value)
              "
              (removeControl)="removeControl('positive', $event)"
            />
            <rr-control-column
              [controls]="negativeControls"
              label="Controlli negativi"
              [fieldErrors]="fieldErrors"
              tone="negative"
              (addControl)="addControl('negative')"
              (controlValueChange)="
                setControl('negative', $event.index, $event.value)
              "
              (removeControl)="removeControl('negative', $event)"
            />
          </div>
        </rr-panel>

        @if (error) {
          <rr-inline-error [message]="error" />
        }
        <button
          aria-label="Pubblica sfida"
          class="button primary publish-button"
          [disabled]="pending"
          type="submit"
        >
          {{ pending ? "Pubblicazione..." : "Pubblica sfida" }}
        </button>
      </form>
    </section>
  `
})
export class CreateChallengeFormComponent {
  @Output() created = new EventEmitter<ChallengeDetailDTO>();

  private readonly challengeApi = inject(ChallengeApiService);

  title = "";
  description = "";
  difficulty: ChallengeDifficulty = "EASY";
  difficultyOptions = DIFFICULTY_OPTIONS;
  difficultyLabel = difficultyLabel;
  secretPattern = "";
  positiveExample = "";
  negativeExample = "";
  positiveControls = createInitialControlValues();
  negativeControls = createInitialControlValues();
  fieldErrors = new Map<CreateChallengeField, string>();
  error: string | null = null;
  readonly descriptionMaxLength = CHALLENGE_DESCRIPTION_MAX_LENGTH;
  readonly descriptionMinLength = CHALLENGE_DESCRIPTION_MIN_LENGTH;
  readonly exampleMaxLength = CHALLENGE_EXAMPLE_MAX_LENGTH;
  readonly exampleMinLength = CHALLENGE_EXAMPLE_MIN_LENGTH;
  maxControls = MAX_CONTROLS_PER_KIND;
  minControls = MIN_CONTROLS_PER_KIND;
  readonly patternMaxLength = CHALLENGE_PATTERN_MAX_LENGTH;
  readonly patternMinLength = CHALLENGE_PATTERN_MIN_LENGTH;
  pending = false;
  readonly titleMaxLength = CHALLENGE_TITLE_MAX_LENGTH;
  readonly titleMinLength = CHALLENGE_TITLE_MIN_LENGTH;

  fieldError(field: CreateChallengeField): string | undefined {
    return this.fieldErrors.get(field);
  }

  hasFieldError(field: CreateChallengeField): boolean {
    return this.fieldErrors.has(field);
  }

  clearFieldError(field: CreateChallengeField): void {
    if (!this.fieldErrors.has(field)) {
      return;
    }

    const next = new Map(this.fieldErrors);
    next.delete(field);
    this.fieldErrors = next;
  }

  addControl(tone: ControlTone): void {
    if (tone === "positive") {
      this.positiveControls = appendControlValue(this.positiveControls);
      return;
    }

    this.negativeControls = appendControlValue(this.negativeControls);
  }

  removeControl(tone: ControlTone, index: number): void {
    if (tone === "positive") {
      this.positiveControls = removeControlValue(this.positiveControls, index);
      this.recalculateControlErrors("positive");
      return;
    }

    this.negativeControls = removeControlValue(this.negativeControls, index);
    this.recalculateControlErrors("negative");
  }

  setControl(tone: ControlTone, index: number, value: string): void {
    const values =
      tone === "positive" ? this.positiveControls : this.negativeControls;
    const nextValues = replaceControlValue(values, index, value);

    if (tone === "positive") {
      this.positiveControls = nextValues;
    } else {
      this.negativeControls = nextValues;
    }

    this.fieldErrors = clearControlError(this.fieldErrors, tone, index);
  }

  async submit(): Promise<void> {
    if (this.pending) {
      return;
    }

    this.error = null;

    const state = this.currentState();
    const validation = validateCreateChallenge(state);
    this.fieldErrors = validation.fieldErrors;
    this.error = validation.formError;

    if (this.fieldErrors.size > 0 || this.error !== null) {
      return;
    }

    const payload = buildCreateChallengePayload(state);

    this.pending = true;

    try {
      const created = await this.challengeApi.createChallenge(payload);
      this.created.emit(created);
    } catch (caught) {
      this.error = createChallengeSubmissionMessage(caught);
    } finally {
      this.pending = false;
    }
  }

  private recalculateControlErrors(tone: ControlTone): void {
    this.fieldErrors = recalculateControlErrors(
      this.fieldErrors,
      tone === "positive" ? this.positiveControls : this.negativeControls,
      tone
    );
  }

  private currentState(): CreateChallengeFormState {
    return {
      description: this.description,
      difficulty: this.difficulty,
      negativeControls: this.negativeControls,
      negativeExample: this.negativeExample,
      positiveControls: this.positiveControls,
      positiveExample: this.positiveExample,
      secretPattern: this.secretPattern,
      title: this.title
    };
  }
}
