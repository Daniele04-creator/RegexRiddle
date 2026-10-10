import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import {
  isPublicApiErrorCode,
  type PublicApiErrorCode,
  type PublicApiErrorResponseDTO
} from "@regexriddle/shared";

function isApiError(value: unknown): value is PublicApiErrorResponseDTO {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    isPublicApiErrorCode(value.code) &&
    "error" in value &&
    typeof value.error === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function toApiFailure(error: unknown) {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      code: null,
      message: "Richiesta non riuscita."
    };
  }

  const response = error.error as unknown;
  const apiError = isApiError(response) ? response : null;

  return {
    code: apiError?.code ?? null,
    message: apiError?.message ?? "Richiesta non riuscita."
  };
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);

  private async request<T>(
    method: "GET" | "POST" | "PATCH",
    path: string,
    body?: unknown
  ): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.request<T>(method, path, {
          body,
          credentials: "include",
          headers:
            body === undefined
              ? undefined
              : {
                  "content-type": "application/json"
                }
        })
      );
    } catch (error) {
      throw toApiFailure(error);
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }
}

export function apiErrorCode(error: unknown): PublicApiErrorCode | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  return isPublicApiErrorCode(error.code) ? error.code : null;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;

    return typeof message === "string" ? message : fallback;
  }

  return fallback;
}
