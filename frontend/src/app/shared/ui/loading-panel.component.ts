import { Component, Input } from "@angular/core";
import { LucideTerminal } from "@lucide/angular";

@Component({
  selector: "rr-loading-panel",
  standalone: true,
  imports: [LucideTerminal],
  template: `
    <section class="page-narrow">
      <div class="loading-panel motion-in" aria-busy="true">
        <svg lucideTerminal aria-hidden="true" [size]="20"></svg>
        {{ label }}
      </div>
    </section>
  `
})
export class LoadingPanelComponent {
  @Input({ required: true }) label!: string;
}
