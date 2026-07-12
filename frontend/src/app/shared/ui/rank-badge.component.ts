import { Component, Input } from "@angular/core";

@Component({
  selector: "rr-rank-badge",
  standalone: true,
  template: `
    @if (variant(); as variant) {
      <span
        [attr.aria-label]="'Posizione ' + rank"
        [class]="'rank-medal rank-medal-' + variant"
        role="img"
      >
        <span aria-hidden="true" class="rank-medal-disc">{{ rank }}</span>
      </span>
    } @else {
      <span class="rank">#{{ rank }}</span>
    }
  `
})
export class RankBadgeComponent {
  @Input({ required: true }) rank!: number;

  variant(): "gold" | "silver" | "bronze" | null {
    if (this.rank === 1) {
      return "gold";
    }

    if (this.rank === 2) {
      return "silver";
    }

    if (this.rank === 3) {
      return "bronze";
    }

    return null;
  }
}
