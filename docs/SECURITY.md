# Security

## Non-negotiable invariants

- Do not use JavaScript `RegExp` to evaluate user-provided regex.
- Regex evaluation must use full-match semantics.
- Regex evaluation must use a RE2-compatible engine server-side.
- Do not expose original challenge regexes or secret controls to solver clients.
- Do not log secret regexes, secret checks, passwords, tokens, session IDs, or raw sensitive payloads.
- Validate every input on the server.
- Authorize every protected endpoint.
- Prevent IDOR and mass assignment in future domain endpoints.
- Use opaque server-side sessions with `HttpOnly` and `SameSite` cookies when auth is implemented.
- Use Argon2id when passwords are implemented.

## GOAL 06 security posture

GOAL 06 adds protected challenge creation. The project still has no frontend auth UI, no frontend challenge authoring UI, no uploads, and no leaderboard.

Regex engine decisions:

- `re2-wasm` `1.0.2` provides Google's RE2 engine through WASM.
- User-provided patterns are not evaluated with JavaScript `RegExp`.
- Evaluation uses full-string semantics by wrapping patterns with RE2 absolute text anchors: `\A(?:pattern)\z`.
- `^...$` is intentionally avoided because multiline mode changes those anchors.
- Supported user flags are only `i` and `m`.
- The internal `u` flag is always added because `re2-wasm` requires Unicode mode.
- Duplicate, unknown, and unsupported flags are rejected.
- RE2-incompatible features such as backreferences and lookahead assertions are rejected with controlled errors.
- Engine functions return aggregate counts only and never return `ChallengeControl.value`, `Challenge.secretPattern`, or candidate patterns.
- Error messages and logs must not include secret regexes, control values, submitted candidate patterns, or input strings.

Attempt endpoint decisions:

- `POST /api/challenges/:id/attempts` requires a valid `rr_session` cookie.
- The route uses CSRF guard v1: protected JSON mutations require `Content-Type: application/json` and `X-RegexRiddle-CSRF: 1`.
- CSRF guard v1 is a lightweight custom-header guard for the current same-origin frontend plan, not a full synchronizer-token system.
- Auth login/register behavior is unchanged.
- The current user is derived only from the server-side session; clients cannot submit `userId`.
- Authors cannot attempt their own challenges.
- Already solved challenges return `409 Conflict` and do not create another attempt.
- Invalid or RE2-incompatible candidate regexes return `422 Unprocessable Entity` and do not create an `Attempt`.
- Successful and failed attempt responses return only aggregate counts.
- `Attempt.proposedPattern` is stored for future private history/audit use but is not returned by the public attempt response.

Challenge creation endpoint decisions:

- `POST /api/challenges` requires a valid `rr_session` cookie.
- The route uses CSRF guard v1: protected JSON mutations require `Content-Type: application/json` and `X-RegexRiddle-CSRF: 1`.
- The current author is derived only from the server-side session; clients cannot submit `authorId`.
- Unknown body keys are rejected to prevent mass assignment.
- The secret regex, flags, public examples, and secret controls are validated server-side with the RE2-compatible full-match engine before persistence.
- Invalid or RE2-incompatible secret regexes and invalid flags return `422 Unprocessable Entity` and do not create a challenge.
- Incoherent examples or controls return `422 Unprocessable Entity` and do not create a challenge.
- Successful creation creates `Challenge` and `ChallengeControl` rows transactionally.
- Successful creation returns only the public challenge detail DTO and never returns `Challenge.secretPattern`, control lists, or `ChallengeControl.value`.

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

CSRF guard v1 is implemented for protected cookie-authenticated product writes. Future protected mutations must reuse or strengthen this guard before release.

## Future review checklist

- XSS checks for UI rendering.
- CSRF checks for cookie-authenticated mutations.
- SQL injection protection through parameterized ORM queries.
- SSRF review before adding any outbound fetch feature.
- Path traversal review before file upload or export features.
