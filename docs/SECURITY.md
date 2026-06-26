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

## GOAL 02 security posture

GOAL 02 adds public read-only challenge endpoints, but still has no auth endpoints, no challenge mutation endpoints, no uploads, no attempt submission, and no regex evaluation.

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

Public API tests and E2E tests include anti-leak assertions for forbidden response keys including `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, and `sessionTokenHash`.

## Future review checklist

- XSS checks for UI rendering.
- CSRF checks for cookie-authenticated mutations.
- SQL injection protection through parameterized ORM queries.
- SSRF review before adding any outbound fetch feature.
- Path traversal review before file upload or export features.
