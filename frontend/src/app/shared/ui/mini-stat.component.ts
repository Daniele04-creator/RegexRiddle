import { Component, Input } from "@angular/core";

@Component({
  selector: "rr-mini-stat",
  standalone: true,
  template: `
    <div [class]="tone ? 'mini-stat ' + tone : 'mini-stat'">
      <ng-content />
      <strong>{{ value }}</strong>
      <span>{{ label }}</span>
    </div>
  `
})
export class MiniStatComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: "blue" | "green" | "violet" | "yellow" | "" = "";
  @Input({ required: true }) value!: string | number;
}
