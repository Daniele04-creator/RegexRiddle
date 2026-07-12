import { Component, Input } from "@angular/core";
import { LucideCircleAlert } from "@lucide/angular";

@Component({
  selector: "rr-inline-error",
  standalone: true,
  imports: [LucideCircleAlert],
  template: `
    <div class="inline-error" role="alert">
      <svg lucideCircleAlert aria-hidden="true" [size]="16"></svg>
      <span>{{ message }}</span>
    </div>
  `
})
export class InlineErrorComponent {
  @Input({ required: true }) message!: string;
}
