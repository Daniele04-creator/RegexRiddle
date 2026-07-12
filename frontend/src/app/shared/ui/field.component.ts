import { Component, Input } from "@angular/core";

@Component({
  selector: "rr-field",
  standalone: true,
  template: `
    <label class="field">
      <span [class]="labelClassName">{{ label }}</span>
      <ng-content />
      @if (error) {
        <p class="field-error" [id]="errorId" role="alert">{{ error }}</p>
      }
    </label>
  `
})
export class FieldComponent {
  @Input({ required: true }) label!: string;
  @Input() labelClassName = "";
  @Input() error: string | undefined;
  @Input() errorId: string | undefined;
}
