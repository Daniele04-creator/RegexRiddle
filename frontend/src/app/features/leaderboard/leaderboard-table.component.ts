import { Component, Input } from "@angular/core";
import type { LeaderboardItemDTO } from "@regexriddle/shared";

import { formatAverage } from "../../shared/app.shared";
import { RankBadgeComponent } from "../../shared/ui.components";
import { LeaderboardRowComponent } from "./leaderboard-row.component";

@Component({
  selector: "rr-leaderboard-table",
  standalone: true,
  imports: [LeaderboardRowComponent, RankBadgeComponent],
  template: `
    <div class="leader-card motion-in delayed">
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Giocatore</th>
            <th scope="col">Risolte</th>
            <th scope="col">Media tentativi</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items; track item.user.username) {
            <tr
              rr-leaderboard-row
              [currentUsername]="currentUsername"
              [item]="item"
            ></tr>
          }
        </tbody>
      </table>

      <div class="mobile-leaderboard" aria-label="Classifica mobile">
        @for (item of items; track item.user.username) {
          <dl>
            <dt>Posizione</dt>
            <dd><rr-rank-badge [rank]="item.rank" /></dd>
            <dt>Giocatore</dt>
            <dd>@{{ item.user.username }}</dd>
            <dt>Risolte</dt>
            <dd>{{ item.solvedCount }}</dd>
            <dt>Media</dt>
            <dd>{{ formatAverage(item.averageAttempts) }}</dd>
          </dl>
        }
      </div>
    </div>
  `
})
export class LeaderboardTableComponent {
  @Input() currentUsername: string | undefined;
  @Input({ required: true }) items!: LeaderboardItemDTO[];
  formatAverage = formatAverage;
}
