export const CSRF_HEADER_NAME = "X-RegexRiddle-CSRF";
export const CSRF_HEADER_VALUE = "1";

interface CsrfHeaderOptions {
  protectedMutation: boolean;
}

export function createCsrfHeaders({
  protectedMutation
}: CsrfHeaderOptions): HeadersInit {
  if (!protectedMutation) {
    return {};
  }

  return {
    [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE
  };
}
