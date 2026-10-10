import { Injectable, signal } from "@angular/core";

import {
  API_AUTH_LOGIN_PATH,
  API_AUTH_LOGOUT_PATH,
  API_AUTH_ME_PATH,
  API_AUTH_REGISTER_PATH,
  type AuthSuccessResponseDTO,
  type AuthUserResponseDTO,
  type PublicUserDTO
} from "@regexriddle/shared";

import { apiErrorCode, ApiService } from "./api.service";
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly userState = signal<PublicUserDTO | null>(null);

  readonly user = this.userState.asReadonly();

  constructor(private readonly api: ApiService) {}

  async load(): Promise<void> {
    this.userState.set(await this.loadCurrentUser());
  }

  setUser(user: PublicUserDTO | null): void {
    this.userState.set(user);
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.api.post<AuthUserResponseDTO>(
      API_AUTH_LOGIN_PATH,
      { password, username }
    );

    this.setUser(response.user);
  }

  async register(username: string, password: string): Promise<void> {
    await this.api.post<AuthSuccessResponseDTO>(API_AUTH_REGISTER_PATH, {
      password,
      username
    });
  }

  async logout(): Promise<void> {
    await this.api.post<AuthSuccessResponseDTO>(API_AUTH_LOGOUT_PATH, {});
    this.setUser(null);
  }

  private async loadCurrentUser(): Promise<PublicUserDTO | null> {
    try {
      const response =
        await this.api.get<AuthUserResponseDTO>(API_AUTH_ME_PATH);

      return response.user;
    } catch (error) {
      if (apiErrorCode(error) === "UNAUTHORIZED") {
        return null;
      }

      throw error;
    }
  }
}
