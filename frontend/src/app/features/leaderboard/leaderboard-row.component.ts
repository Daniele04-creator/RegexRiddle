import { Component, Input } from "@angular/core";
import type { LeaderboardItemDTO } from "@regexriddle/shared";

import { formatAverage } from "../../shared/app.shared";
import {
  AvatarComponent,
  RankBadgeComponent
} from "../../shared/ui.components";

@Component({
  selector: "tr[rr-leaderboard-row]",
  standalone: true,
  imports: [AvatarComponent, RankBadgeComponent],
  host: {
    class: "leader-row",
    "[class.me]": "isMe()"
  },
  template: `
    <td><rr-rank-badge [rank]="item.rank" /></td>
    <td>
      <span class="leader-player">
        <rr-avatar [username]="item.user.username" [size]="28" />
        <span>
          <strong>@{{ item.user.username }}</strong>
          @if (isMe()) {
            <em>(tu)</em>
          }
        </span>
      </span>
    </td>
    <td>
      <strong>{{ item.solvedCount }}</strong>
    </td>
    <td>{{ formatAverage(item.averageAttempts) }}</td>
  `
})
export class LeaderboardRowComponent {
  @Input() currentUsername: string | undefined;
  @Input({ required: true }) item!: LeaderboardItemDTO;
  formatAverage = formatAverage;

  isMe(): boolean {
    return this.currentUsername === this.item.user.username;
  }
}
