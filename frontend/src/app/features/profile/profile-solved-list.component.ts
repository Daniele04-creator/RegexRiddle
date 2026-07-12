import { Component, Input } from "@angular/core";
import { LucideCircleCheck } from "@lucide/angular";
import type { PublicUserDTO } from "@regexriddle/shared";

import { difficultyClass, difficultyLabel } from "../../shared/app.shared";

@Component({
  selector: "rr-profile-solved-list",
  standalone: true,
  imports: [LucideCircleCheck],
  template: `
    <ul class="profile-riddle-list">
      @for (item of items; track item.id) {
        <li class="profile-riddle-row">
          <span [class]="difficultyClass(item.difficulty)">
            {{ difficultyLabel(item.difficulty) }}
          </span>
          <strong>{{ item.title }}</strong>
          <span class="profile-row-meta">
            {{ item.attemptsUsed }}
            {{ item.attemptsUsed === 1 ? "tentativo" : "tentativi" }}
          </span>
          <svg
            lucideCircleCheck
            aria-hidden="true"
            class="green-text"
            [size]="18"
          ></svg>
        </li>
      }
    </ul>
  `
})
export class ProfileSolvedListComponent {
  @Input({ required: true }) items!: PublicUserDTO["solvedChallenges"];
  difficultyLabel = difficultyLabel;
  difficultyClass = difficultyClass;
}
