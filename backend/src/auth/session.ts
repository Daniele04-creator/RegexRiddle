import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "rr_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1_000;

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function shouldUseSecureSessionCookie(): boolean {
  if (process.env.AUTH_COOKIE_SECURE !== undefined) {
    return process.env.AUTH_COOKIE_SECURE === "true";
  }

  return process.env.NODE_ENV === "production";
}

export function buildSessionCookie(token: string, expiresAt: Date): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    `Expires=${expiresAt.toUTCString()}`
  ];

  if (shouldUseSecureSessionCookie()) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function buildExpiredSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ].join("; ");
}

export function readSessionTokenFromCookieHeader(
  cookieHeader: string | string[] | undefined
): string | null {
  const header =
    Array.isArray(cookieHeader) ? cookieHeader.join("; ") : cookieHeader;

  if (header === undefined || header.trim() === "") {
    return null;
  }

  const cookies = header.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName !== SESSION_COOKIE_NAME) {
      continue;
    }

    const rawValue = rawValueParts.join("=");

    if (rawValue === "") {
      return null;
    }

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return null;
    }
  }

  return null;
}
