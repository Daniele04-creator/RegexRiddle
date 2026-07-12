import { PanelComponent } from "../../shared/ui.components";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideCircleX } from "@lucide/angular";

@Component({
  selector: "rr-not-found-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [RouterLink, PanelComponent, LucideCircleX],
  template: `
    <section class="page-narrow">
      <rr-panel className="center-panel">
        <svg lucideCircleX class="muted-icon" [size]="34"></svg>
        <h1>Pagina non trovata</h1>
        <a class="button primary" routerLink="/">Torna alla home</a>
      </rr-panel>
    </section>
  `
})
export class NotFoundPageComponent {}
