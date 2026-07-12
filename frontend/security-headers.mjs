const SECURITY_HEADERS = Object.freeze({
  "content-security-policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:"
  ].join("; "),
  "x-content-type-options": "nosniff"
});

export function withSecurityHeaders(headers = {}) {
  return {
    ...SECURITY_HEADERS,
    ...headers
  };
}
