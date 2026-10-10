import { Component, Input } from "@angular/core";
import {
  LucideFlaskConical,
  LucideInfo,
  LucideTerminal,
  LucideTrendingUp,
  LucideTrophy
} from "@lucide/angular";

@Component({
  selector: "rr-timeline-step",
  standalone: true,
  imports: [
    LucideFlaskConical,
    LucideInfo,
    LucideTerminal,
    LucideTrendingUp,
    LucideTrophy
  ],
  template: `
    <article class="timeline-step motion-in">
      <div class="timeline-icon">
        @if (icon === "terminal") {
          <svg lucideTerminal [size]="22"></svg>
        } @else if (icon === "info") {
          <svg lucideInfo [size]="22"></svg>
        } @else if (icon === "flask") {
          <svg lucideFlaskConical [size]="22"></svg>
        } @else if (icon === "trend") {
          <svg lucideTrendingUp [size]="22"></svg>
        } @else {
          <svg lucideTrophy [size]="22"></svg>
        }
      </div>
      <div class="timeline-copy">
        <span class="timeline-kicker">Step {{ step }}</span>
        <h2>{{ title }}</h2>
        <p>{{ text }}</p>
        <div class="timeline-note">
          <svg lucideInfo aria-hidden="true" [size]="15"></svg>
          {{ note }}
        </div>
      </div>
    </article>
  `
})
export class TimelineStepComponent {
  @Input({ required: true }) icon!:
    "terminal" | "info" | "flask" | "trend" | "trophy";
  @Input({ required: true }) note!: string;
  @Input({ required: true }) step!: string;
  @Input({ required: true }) text!: string;
  @Input({ required: true }) title!: string;
}
