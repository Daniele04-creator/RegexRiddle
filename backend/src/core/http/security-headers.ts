import type { FastifyReply } from "fastify";

const API_SECURITY_HEADERS = Object.freeze({
  "content-security-policy":
    "default-src 'none'; base-uri 'none'; form-action 'none'",
  "x-content-type-options": "nosniff"
});

export function applySecurityHeaders(reply: FastifyReply): void {
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) {
    reply.header(name, value);
  }
}
