# Security

## Non-negotiable invariants

- Do not use JavaScript `RegExp` to evaluate user-provided regex.
- Future regex evaluation must use full-match semantics.
- Future regex evaluation must use a RE2-compatible engine server-side.
- Do not expose original challenge regexes or secret controls to solver clients.
- Do not log secret regexes, secret checks, passwords, tokens, session IDs, or raw sensitive payloads.
- Validate every input on the server.
- Authorize every protected endpoint.
- Prevent IDOR and mass assignment in future domain endpoints.
- Use opaque server-side sessions with `HttpOnly` and `SameSite` cookies when auth is implemented.
- Use Argon2id when passwords are implemented.

## GOAL 03 security posture

GOAL 03 adds backend authentication endpoints, but still has no frontend auth UI, no challenge mutation endpoints, no uploads, no attempt submission, and no regex evaluation.

Authentication decisions:

- Passwords are hashed with Argon2id through `argon2`.
- Sessions are opaque server-side records.
- The raw session token is generated with cryptographic randomness and sent only in the `rr_session` cookie.
- The database stores only `Session.sessionTokenHash`, a SHA-256 hash of the raw token.
- Auth cookies are `HttpOnly`, `SameSite=Lax`, `Path=/`, and have a 7-day `Max-Age`.
- `Secure` is enabled by default when `NODE_ENV=production`, but local Docker HTTP sets `AUTH_COOKIE_SECURE=false`.
- JWT is not used.
- Browser `localStorage` and `sessionStorage` are not used for tokens.
- Auth routes return explicit public user DTOs and never raw Prisma user or session records.

Public challenge routes use explicit validation and DTO serializers:

- `GET /api/challenges` accepts only `page` and `limit`.
- `GET /api/challenges/:id` accepts only a UUID route parameter.
- Unknown query parameters are rejected.
- Clients cannot pass arbitrary Prisma `include`, `select`, or `where` data.
- Route handlers return DTOs, not raw Prisma records.

The public Prisma select for these routes includes only public challenge fields, public author identity fields, and aggregate counts. It does not select secret challenge patterns, secret controls, attempt payloads, password hashes, or session token hashes.

Sensitive database fields:

- `Challenge.secretPattern`
- `ChallengeControl.value`
- `Attempt.proposedPattern`
- `Session.sessionTokenHash`
- `User.passwordHash`

These fields must not be exposed through public DTOs or logs. Seed and verify scripts print counts only.

Public API tests and E2E tests include anti-leak assertions for forbidden response keys including `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, `token`, and `sessionToken`.

CSRF is not implemented in GOAL 03 because no protected state-changing product workflows exist yet beyond auth session lifecycle. Future cookie-authenticated mutations must be reviewed for CSRF protections before release.

## Future review checklist

- XSS checks for UI rendering.
- CSRF checks for cookie-authenticated mutations.
- SQL injection protection through parameterized ORM queries.
- SSRF review before adding any outbound fetch feature.
- Path traversal review before file upload or export features.
