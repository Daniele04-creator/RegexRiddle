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

## GOAL 01 security posture

GOAL 01 has database tables and demo data, but still has no auth endpoints, no public challenge endpoints, no uploads, and no regex evaluation. The only API route is `GET /health`, which returns non-sensitive service metadata.

Sensitive database fields:

- `Challenge.secretPattern`
- `ChallengeControl.value`
- `Attempt.proposedPattern`
- `Session.sessionTokenHash`
- `User.passwordHash`

These fields must not be exposed through public DTOs or logs. Seed and verify scripts print counts only.

## Future review checklist

- XSS checks for UI rendering.
- CSRF checks for cookie-authenticated mutations.
- SQL injection protection through parameterized ORM queries.
- SSRF review before adding any outbound fetch feature.
- Path traversal review before file upload or export features.
