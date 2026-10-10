import { Component, Input, OnChanges } from "@angular/core";
import {
  isSupportedAvatarSource,
  type PublicUserDTO
} from "@regexriddle/shared";

@Component({
  selector: "rr-avatar",
  standalone: true,
  template: `
    @if (avatarSource) {
      <img
        [alt]="label"
        class="avatar"
        [src]="avatarSource"
        [style.height.px]="size"
        [style.width.px]="size"
      />
    } @else {
      <span
        class="avatar"
        [attr.aria-label]="label"
        [style.background]="color"
        [style.font-size.px]="size * 0.38"
        [style.height.px]="size"
        [style.width.px]="size"
      >
        {{ initials }}
      </span>
    }
  `
})
export class AvatarComponent implements OnChanges {
  @Input() user: PublicUserDTO | undefined;
  @Input() username: string | undefined;
  @Input() size = 30;

  private readonly palette = [
    "#7c3aed",
    "#2563eb",
    "#059669",
    "#d97706",
    "#dc2626",
    "#0891b2"
  ];

  avatarSource: string | null = null;
  label = "giocatore";
  initials = "GI";
  color = this.palette[0];

  ngOnChanges(): void {
    this.avatarSource = this.resolveAvatarSource();
    this.label = this.resolveLabel();
    this.initials = this.resolveInitials();
    this.color = this.resolveColor();
  }

  private resolveAvatarSource(): string | null {
    const source = this.user?.avatarUrl?.trim();

    return source && isSupportedAvatarSource(source) ? source : null;
  }

  private resolveLabel(): string {
    return this.user?.username ?? this.username ?? "giocatore";
  }

  private resolveInitials(): string {
    const source = this.user ? this.label.slice(0, 1) : this.name().slice(0, 2);

    return source.toUpperCase();
  }

  private resolveColor(): string {
    const name = this.name();

    return (
      this.palette[name.charCodeAt(0) % this.palette.length] ?? this.palette[0]
    );
  }

  private name(): string {
    return this.user?.username ?? this.username ?? "giocatore";
  }
}
