import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideTrophy } from "@lucide/angular";
import type { ChallengeDetailDTO } from "@regexriddle/shared";

import { AuthService } from "../../core/auth.service";
import { PanelComponent } from "../../shared/ui.components";
import { CreateChallengeFormComponent } from "./create-challenge-form.component";

@Component({
  selector: "rr-create-challenge-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    PanelComponent,
    CreateChallengeFormComponent,
    LucideTrophy
  ],
  template: `
    @if (createdChallenge) {
      <section class="page-narrow">
        <rr-panel className="center-panel">
          <svg lucideTrophy class="amber-text" [size]="54"></svg>
          <h1>Sfida pubblicata!</h1>
          <p>Sfida creata</p>
          <div class="center-actions">
            <a
              class="button primary"
              [routerLink]="['/challenges', createdChallenge.id]"
              >Apri sfida</a
            >
            <a class="button outline" routerLink="/challenges"
              >Vedi tutte le sfide</a
            >
          </div>
        </rr-panel>
      </section>
    } @else {
      <rr-create-challenge-form (created)="handleCreated($event)" />
    }
  `
})
export class CreateChallengePageComponent {
  readonly auth = inject(AuthService);
  createdChallenge: ChallengeDetailDTO | null = null;

  handleCreated(challenge: ChallengeDetailDTO): void {
    this.createdChallenge = challenge;
    void this.auth.load().catch(() => undefined);
  }
}
