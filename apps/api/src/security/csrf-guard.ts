export const CSRF_HEADER_NAME = "x-regexriddle-csrf";
export const CSRF_HEADER_VALUE = "1";

interface MutationGuardSuccess {
  success: true;
}

interface MutationGuardFailure {
  success: false;
  statusCode: 400 | 403;
  error: "Bad Request" | "Forbidden";
  message: string;
}

export type ProtectedJsonMutationGuardResult =
  | MutationGuardSuccess
  | MutationGuardFailure;

function readSingleHeader(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function isJsonContentType(contentType: string): boolean {
  return contentType
    .split(";")[0]
    ?.trim()
    .toLowerCase() === "application/json";
}

export function validateProtectedJsonMutationHeaders(headers: {
  [key: string]: string | string[] | undefined;
}): ProtectedJsonMutationGuardResult {
  const contentType = readSingleHeader(headers["content-type"]);

  if (!isJsonContentType(contentType)) {
    return {
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Content-Type must be application/json."
    };
  }

  const csrfHeader = readSingleHeader(headers[CSRF_HEADER_NAME]);

  if (csrfHeader !== CSRF_HEADER_VALUE) {
    return {
      success: false,
      statusCode: 403,
      error: "Forbidden",
      message: "CSRF header is required."
    };
  }

  return { success: true };
}
