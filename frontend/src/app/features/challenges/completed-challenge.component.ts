import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideCircleCheck } from "@lucide/angular";

import { PanelComponent } from "../../shared/ui.components";

@Component({
  selector: "rr-completed-challenge",
  standalone: true,
  imports: [RouterLink, PanelComponent, LucideCircleCheck],
  template: `
    <rr-panel className="center-panel">
      <svg lucideCircleCheck class="green-text" [size]="34"></svg>
      <h2>Sfida già completata</h2>
      <p>{{ attemptsCopy() }}</p>
      <div class="center-actions">
        <a class="button primary" routerLink="/leaderboard">Vedi classifica</a>
        <a class="button outline" routerLink="/challenges">Altre sfide</a>
      </div>
    </rr-panel>
  `
})
export class CompletedChallengeComponent {
  @Input() attemptsUsed: number | null | undefined;

  attemptsCopy(): string {
    if (this.attemptsUsed === undefined || this.attemptsUsed === null) {
      return "Hai già completato questa sfida.";
    }

    return `Hai già risolto questa sfida in ${this.attemptsUsed} ${
      this.attemptsUsed === 1 ? "tentativo" : "tentativi"
    }.`;
  }
}
