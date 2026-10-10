import { Component, Input } from "@angular/core";
import type { PublicUserDTO } from "@regexriddle/shared";

import { difficultyClass, difficultyLabel } from "../../shared/app.shared";

@Component({
  selector: "rr-profile-created-list",
  standalone: true,
  template: `
    <ul class="profile-riddle-list">
      @for (item of items; track item.id) {
        <li class="profile-riddle-row">
          <span [class]="difficultyClass(item.difficulty)">
            {{ difficultyLabel(item.difficulty) }}
          </span>
          <strong>{{ item.title }}</strong>
          <span class="profile-row-meta">
            {{ item.solversTotal }}
            {{ item.solversTotal === 1 ? "soluzione" : "soluzioni" }}
          </span>
        </li>
      }
    </ul>
  `
})
export class ProfileCreatedListComponent {
  @Input({ required: true }) items!: PublicUserDTO["createdChallenges"];
  difficultyLabel = difficultyLabel;
  difficultyClass = difficultyClass;
}
