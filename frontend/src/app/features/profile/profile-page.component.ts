import { apiErrorCode, ApiService, errorMessage } from "../../core/api.service";
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_FILE_BYTES,
  readAvatarFileAsDataUrl
} from "../../shared/app.shared";
import { AuthService } from "../../core/auth.service";
import {
  AvatarComponent,
  InlineErrorComponent,
  MiniStatComponent,
  PanelComponent
} from "../../shared/ui.components";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  LucideCamera,
  LucideCircleCheck,
  LucideClock,
  LucidePlus,
  LucideShield,
  LucideTerminal,
  LucideTrash2,
  LucideZap
} from "@lucide/angular";
import {
  API_AUTH_ME_PATH,
  isSupportedAvatarSource,
  type AccountUpdateRequestDTO,
  type AccountUpdateResponseDTO,
  type PublicUserDTO,
  USERNAME_PATTERN
} from "@regexriddle/shared";
import { ProfileCreatedListComponent } from "./profile-created-list.component";
import { ProfileSolvedListComponent } from "./profile-solved-list.component";

@Component({
  selector: "rr-profile-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    FormsModule,
    AvatarComponent,
    PanelComponent,
    InlineErrorComponent,
    MiniStatComponent,
    ProfileSolvedListComponent,
    ProfileCreatedListComponent,
    LucideCamera,
    LucideCircleCheck,
    LucideClock,
    LucidePlus,
    LucideShield,
    LucideTerminal,
    LucideTrash2,
    LucideZap
  ],
  template: `
    @if (auth.user(); as user) {
      <section class="profile-page">
        <div class="profile-grid">
          <aside class="profile-side">
            <section class="profile-card motion-in">
              <div class="avatar-wrap">
                <rr-avatar [user]="avatarPreview" [size]="90" />
                <input
                  #avatarFileInput
                  aria-label="File avatar"
                  class="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  (change)="changeAvatarFile($event)"
                />
                <button
                  aria-label="Carica immagine avatar"
                  class="avatar-camera"
                  (click)="avatarFileInput.click()"
                  type="button"
                >
                  <svg lucideCamera aria-hidden="true" [size]="13"></svg>
                </button>
                @if (avatarPreview?.avatarUrl) {
                  <button
                    aria-label="Rimuovi immagine avatar"
                    class="avatar-remove"
                    (click)="removeAvatar()"
                    type="button"
                  >
                    <svg lucideTrash2 aria-hidden="true" [size]="13"></svg>
                  </button>
                }
              </div>
              <h1>@{{ user.username }}</h1>
              <button
                class="profile-edit-link"
                (click)="toggleEditing()"
                type="button"
              >
                <svg lucideShield aria-hidden="true" [size]="14"></svg>
                Modifica profilo
              </button>

              @if (editing) {
                <div class="profile-edit">
                  <input
                    aria-label="Username"
                    [(ngModel)]="username"
                    name="username"
                  />
                  <button
                    class="button primary"
                    [disabled]="pending"
                    (click)="save()"
                    type="button"
                  >
                    {{ pending ? "Salvataggio..." : "Salva" }}
                  </button>
                </div>
              }

              @if (savedMessage) {
                <p class="success-copy">{{ savedMessage }}</p>
              }
              @if (error) {
                <rr-inline-error [message]="error" />
              }
            </section>

            <section class="profile-card stats-card motion-in">
              <div class="mini-grid">
                <rr-mini-stat
                  label="Risolte"
                  tone="green"
                  [value]="user.stats.solvedTotal"
                >
                  <svg lucideCircleCheck [size]="15"></svg>
                </rr-mini-stat>
                <rr-mini-stat
                  label="Create"
                  tone="violet"
                  [value]="user.stats.createdTotal"
                >
                  <svg lucidePlus [size]="15"></svg>
                </rr-mini-stat>
                <rr-mini-stat
                  label="Iscritto"
                  tone="blue"
                  [value]="user.createdAt.slice(0, 10)"
                >
                  <svg lucideClock [size]="15"></svg>
                </rr-mini-stat>
                <rr-mini-stat
                  label="Tentativi"
                  tone="yellow"
                  [value]="user.stats.attemptsTotal"
                >
                  <svg lucideZap [size]="15"></svg>
                </rr-mini-stat>
              </div>
            </section>
          </aside>

          <div class="profile-main">
            <div>
              <h2 class="profile-section-title">
                <svg lucideCircleCheck aria-hidden="true" [size]="19"></svg>
                Sfide risolte <span>({{ user.stats.solvedTotal }})</span>
              </h2>
              @if (user.solvedChallenges.length > 0) {
                <rr-profile-solved-list [items]="user.solvedChallenges" />
              } @else {
                <rr-panel className="profile-empty-panel">
                  <p>Non hai ancora risolto nessuna sfida.</p>
                </rr-panel>
              }
            </div>
            <div>
              <h2 class="profile-section-title">
                <svg lucideTerminal aria-hidden="true" [size]="19"></svg>
                Sfide create <span>({{ user.stats.createdTotal }})</span>
              </h2>
              @if (user.createdChallenges.length > 0) {
                <rr-profile-created-list [items]="user.createdChallenges" />
              } @else {
                <rr-panel className="profile-empty-panel">
                  <p>Non hai ancora creato nessuna sfida.</p>
                </rr-panel>
              }
            </div>
          </div>
        </div>
      </section>
    }
  `
})
export class ProfilePageComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  avatarPreview: PublicUserDTO | undefined;
  username = "";
  avatarUrl = "";
  savedMessage: string | null = null;
  error: string | null = null;
  pending = false;
  editing = false;

  constructor() {
    effect(() => {
      const user = this.auth.user();

      if (user === null) {
        this.avatarPreview = undefined;
        return;
      }

      this.syncUserState(user);
    });
  }

  private updateAvatarPreview(user: PublicUserDTO): void {
    const avatarUrlForPreview = this.avatarUrl.trim();
    let avatarUrl = user.avatarUrl;

    if (avatarUrlForPreview === "") {
      avatarUrl = null;
    } else if (isSupportedAvatarSource(avatarUrlForPreview)) {
      avatarUrl = avatarUrlForPreview;
    }

    this.avatarPreview = {
      ...user,
      avatarUrl
    };
  }

  removeAvatar(): void {
    const user = this.auth.user();

    if (user === null) {
      return;
    }

    this.avatarUrl = "";
    this.updateAvatarPreview(user);
    this.error = null;
    this.savedMessage = null;
    this.editing = true;
  }

  toggleEditing(): void {
    this.editing = !this.editing;
  }

  async save(): Promise<void> {
    if (this.pending) {
      return;
    }

    const username = this.username.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(username)) {
      this.error =
        "Usa 3-32 caratteri: lettere minuscole, numeri o underscore.";
      return;
    }

    const trimmedAvatarUrl = this.avatarUrl.trim();
    const payload: AccountUpdateRequestDTO = {
      avatarUrl: trimmedAvatarUrl === "" ? null : trimmedAvatarUrl,
      username
    };

    this.pending = true;
    this.error = null;
    this.savedMessage = null;

    try {
      const response = await this.api.patch<AccountUpdateResponseDTO>(
        API_AUTH_ME_PATH,
        payload
      );
      this.auth.setUser(response.user);
      this.syncUserState(response.user);
      this.savedMessage = "Profilo aggiornato.";
      this.editing = false;
    } catch (caught) {
      this.error =
        apiErrorCode(caught) === "USERNAME_IN_USE"
          ? "Username già in uso."
          : errorMessage(caught, "Impossibile salvare il profilo.");
    } finally {
      this.pending = false;
    }
  }

  async changeAvatarFile(event: Event): Promise<void> {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.[0] ?? null;
    input.value = "";

    if (file === null) {
      return;
    }

    this.error = null;
    this.savedMessage = null;

    if (!AVATAR_ACCEPTED_TYPES.has(file.type)) {
      this.error = "Formato avatar non supportato. Usa PNG, JPG, WebP o GIF.";
      return;
    }

    if (file.size > AVATAR_MAX_FILE_BYTES) {
      this.error = "Immagine troppo grande. Usa un file fino a 256 KB.";
      return;
    }

    try {
      const nextAvatarUrl = await readAvatarFileAsDataUrl(file);

      if (!isSupportedAvatarSource(nextAvatarUrl)) {
        this.error = "Formato avatar non supportato. Usa PNG, JPG, WebP o GIF.";
        return;
      }

      this.avatarUrl = nextAvatarUrl;
      const user = this.auth.user();
      if (user !== null) {
        this.updateAvatarPreview(user);
      }
      this.editing = true;
    } catch {
      this.error = "Impossibile leggere l'immagine selezionata.";
    }
  }

  private syncUserState(user: PublicUserDTO): void {
    this.username = user.username;
    this.avatarUrl = user.avatarUrl ?? "";
    this.updateAvatarPreview(user);
  }
}
