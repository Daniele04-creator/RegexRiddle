import type { PublicApiErrorResponse } from "@regexriddle/shared";

import { createCsrfHeaders } from "@/lib/csrf";

type JsonBody = Record<string, unknown> | unknown[] | null;
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions<TBody extends JsonBody | undefined = undefined> {
  body?: TBody;
  headers?: HeadersInit;
  method?: HttpMethod;
  protectedMutation?: boolean;
  signal?: AbortSignal;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    const message = readErrorMessage(payload) ?? `Request failed with ${status}.`;

    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

function readErrorMessage(payload: unknown): string | undefined {
  if (payload === null || typeof payload !== "object") {
    return undefined;
  }

  const candidate = payload as Partial<PublicApiErrorResponse>;

  return typeof candidate.message === "string" ? candidate.message : undefined;
}

function assertSameOriginPath(path: string): void {
  if (!path.startsWith("/")) {
    throw new Error("API path must be same-origin and start with '/'.");
  }

  if (path.startsWith("//") || path.includes("://")) {
    throw new Error("API path must be relative to the current origin.");
  }
}

async function readJsonResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (text.trim() === "") {
    return null;
  }

  return JSON.parse(text) as unknown;
}

export async function apiRequest<
  TResponse,
  TBody extends JsonBody | undefined = undefined
>(path: string, options: ApiRequestOptions<TBody> = {}): Promise<TResponse> {
  assertSameOriginPath(path);

  const headers = new Headers(options.headers);
  const method = options.method ?? (options.body === undefined ? "GET" : "POST");
  const requestInit: RequestInit = {
    credentials: "include",
    headers,
    method,
    signal: options.signal
  };

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    requestInit.body = JSON.stringify(options.body);
  }

  for (const [name, value] of Object.entries(
    createCsrfHeaders({ protectedMutation: options.protectedMutation === true })
  )) {
    headers.set(name, value);
  }

  const response = await fetch(path, requestInit);
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new ApiClientError(response.status, payload);
  }

  return payload as TResponse;
}

export function apiGet<TResponse>(path: string, signal?: AbortSignal) {
  return apiRequest<TResponse>(path, { method: "GET", signal });
}
