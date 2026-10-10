import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LucideCheck, LucideX } from "@lucide/angular";
import { CHALLENGE_EXAMPLE_MAX_LENGTH } from "@regexriddle/shared";

import {
  MAX_CONTROLS_PER_KIND,
  MIN_CONTROLS_PER_KIND,
  controlFieldKey
} from "../../shared/app.shared";
import type {
  ControlTone,
  CreateChallengeField
} from "../../shared/app.shared";

@Component({
  selector: "rr-control-column",
  standalone: true,
  imports: [LucideCheck, LucideX],
  template: `
    <div class="control-column">
      <h3 [class]="tone === 'positive' ? 'green-text' : 'red-text'">
        @if (tone === "positive") {
          <svg lucideCheck aria-hidden="true" [size]="15"></svg>
        } @else {
          <svg lucideX aria-hidden="true" [size]="15"></svg>
        }
        {{ label }}
      </h3>

      @for (value of controls; track $index; let index = $index) {
        <div class="control-row">
          <div class="control-input-stack">
            <input
              [attr.aria-describedby]="
                fieldError(index) ? tone + '-control-' + index + '-error' : null
              "
              [attr.aria-invalid]="fieldError(index) ? 'true' : null"
              [attr.aria-label]="textBoxLabel() + ' ' + (index + 1)"
              class="mono-input"
              [attr.maxlength]="maxValueLength"
              (input)="emitValue(index, $event)"
              [placeholder]="
                (tone === 'positive'
                  ? 'Stringa positiva '
                  : 'Stringa negativa ') +
                (index + 1)
              "
              [value]="value"
            />
            @if (fieldError(index); as message) {
              <p
                class="field-error"
                [id]="tone + '-control-' + index + '-error'"
                role="alert"
              >
                {{ message }}
              </p>
            }
          </div>
          <button
            [attr.aria-label]="removeLabel() + ' ' + (index + 1)"
            class="icon-button remove-control"
            [disabled]="controls.length <= minControls"
            (click)="removeControl.emit(index)"
            type="button"
          >
            <svg lucideX aria-hidden="true" [size]="14"></svg>
          </button>
        </div>
      }

      <button
        class="button outline small"
        [disabled]="controls.length >= maxControls"
        (click)="addControl.emit()"
        type="button"
      >
        {{ addLabel() }}
      </button>
    </div>
  `
})
export class ControlColumnComponent {
  @Input({ required: true }) controls!: string[];
  @Input({ required: true }) label!: string;
  @Input({ required: true }) fieldErrors!: ReadonlyMap<
    CreateChallengeField,
    string
  >;
  @Input({ required: true }) tone!: ControlTone;
  @Output() addControl = new EventEmitter<void>();
  @Output() controlValueChange = new EventEmitter<{
    index: number;
    value: string;
  }>();
  @Output() removeControl = new EventEmitter<number>();

  maxControls = MAX_CONTROLS_PER_KIND;
  maxValueLength = CHALLENGE_EXAMPLE_MAX_LENGTH;
  minControls = MIN_CONTROLS_PER_KIND;

  fieldError(index: number): string | undefined {
    return this.fieldErrors.get(controlFieldKey(this.tone, index));
  }

  addLabel(): string {
    return this.tone === "positive"
      ? "Aggiungi prova accettata"
      : "Aggiungi prova rifiutata";
  }

  removeLabel(): string {
    return this.tone === "positive"
      ? "Rimuovi prova da accettare"
      : "Rimuovi prova da rifiutare";
  }

  textBoxLabel(): string {
    return this.tone === "positive"
      ? "Prova da accettare"
      : "Prova da rifiutare";
  }

  emitValue(index: number, event: Event): void {
    this.controlValueChange.emit({
      index,
      value: (event.target as HTMLInputElement).value
    });
  }
}
