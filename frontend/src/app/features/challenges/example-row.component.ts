import { Component, Input } from "@angular/core";
import { LucideCheck, LucideX } from "@lucide/angular";

@Component({
  selector: "rr-example-row",
  standalone: true,
  imports: [LucideCheck, LucideX],
  template: `
    <div [class]="'example-row ' + tone">
      <span>
        @if (tone === "positive") {
          <svg lucideCheck [size]="16"></svg>
        } @else {
          <svg lucideX [size]="16"></svg>
        }
      </span>
      <div>
        <small>{{ label }}</small>
        <code>{{ value }}</code>
      </div>
    </div>
  `
})
export class ExampleRowComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) tone!: "positive" | "negative";
  @Input({ required: true }) value!: string;
}
