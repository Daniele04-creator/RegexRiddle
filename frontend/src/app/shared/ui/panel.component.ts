import { Component, Input } from "@angular/core";

@Component({
  selector: "rr-panel",
  standalone: true,
  template: `
    <section [class]="'panel motion-in ' + className">
      @if (title) {
        <div class="panel-heading">
          <h2 class="panel-title">{{ title }}</h2>
          <ng-content select="[panel-title-meta]" />
        </div>
      }
      <ng-content />
    </section>
  `
})
export class PanelComponent {
  @Input() title = "";
  @Input() className = "";
}
