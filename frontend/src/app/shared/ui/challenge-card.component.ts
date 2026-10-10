import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import type { ChallengeListItemDTO } from "@regexriddle/shared";

import { difficultyClass, difficultyLabel } from "../app.shared";

@Component({
  selector: "rr-challenge-card",
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      class="challenge-card motion-in"
      [routerLink]="['/challenges', challenge.id]"
    >
      <div class="card-head">
        <span [class]="difficultyClass(challenge.difficulty)">
          {{ difficultyLabel(challenge.difficulty) }}
        </span>
      </div>
      <h3>{{ challenge.title }}</h3>
      <p>{{ challenge.description }}</p>
      <div class="challenge-meta">
        <span>@{{ challenge.author.username }}</span>
      </div>
    </a>
  `
})
export class ChallengeCardComponent {
  @Input({ required: true }) challenge!: ChallengeListItemDTO;

  difficultyLabel = difficultyLabel;
  difficultyClass = difficultyClass;
}
