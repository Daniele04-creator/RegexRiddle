import { Component, Input } from "@angular/core";

@Component({
  selector: "rr-empty-state",
  standalone: true,
  template: `
    <div class="empty-state motion-in">
      <ng-content />
      <p>{{ text }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input({ required: true }) text!: string;
}
