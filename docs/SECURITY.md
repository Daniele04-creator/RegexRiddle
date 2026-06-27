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

## GOAL 08.5 security posture

GOAL 08.5 adds the public how-it-works route, scoped current-user account settings, and final UI polish. The project still has no uploads, no profile/statistics page, no password/email change workflow, and no challenge edit/delete UI.

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

Leaderboard endpoint decisions:

- `GET /api/leaderboard` is public and read-only.
- It does not require a session cookie and does not require CSRF.
- It accepts only `page` and `limit`; arbitrary Prisma query controls are rejected.
- It uses `Solution` aggregates for solved count, total attempts used, and average attempts used.
- It fetches only `User.username` and `User.displayName` for public identity.
- It never returns user ids, emails, avatar URLs, secret regexes, control values, submitted patterns, password hashes, session hashes, token values, or cookie values.
- It does not read challenge secret fields, challenge controls, attempt proposed patterns, password hashes, or session token hashes.

Frontend foundation decisions:

- The frontend uses same-origin relative API paths.
- The frontend API client always sends `credentials: "include"` so cookie auth works without browser-readable tokens.
- Vite dev server proxies `/api/*` and `/health` to the backend.
- Docker web server proxies `/api/*` and `/health` to `API_ORIGIN`.
- The frontend does not store auth tokens in `localStorage` or `sessionStorage`.
- The frontend does not read `document.cookie` for auth.
- The frontend does not introduce JWT.
- The frontend does not evaluate user regex with JavaScript `RegExp`.
- The frontend does not use `dangerouslySetInnerHTML`.
- Auth pages avoid rendering sensitive field names or token/cookie values in the DOM.
- `/create` is auth-aware and submits challenge creation data only for authenticated users.

Frontend public-read decisions:

- `/challenges`, `/challenges/:id`, and `/leaderboard` are public read-only pages.
- TanStack Query owns server state for these pages.
- Public reads use same-origin relative API paths through the existing API client.
- Public reads keep `credentials: "include"` for cookie compatibility but do not require auth.
- Challenge UI renders only public examples, public author identity, difficulty, dates, and aggregate counts.
- Leaderboard UI renders only public display name, username, rank, solved count, average attempts, and total attempts used.
- Leaderboard UI does not render user ids, emails, avatar URLs, password hashes, session hashes, raw tokens, or cookie values.
- Public UI does not render secret regexes, hidden controls, or submitted candidate patterns.

Frontend attempt UI decisions:

- `/challenges/:id` shows login/register CTAs to guests and does not render the attempt form.
- `/challenges/:id` blocks authors in the UI, while the backend `403` remains authoritative.
- Authenticated non-authors submit only `pattern` and `flags`.
- Attempt submission uses the existing same-origin API client with `credentials: "include"`.
- Attempt submission sets `X-RegexRiddle-CSRF: 1` through `protectedMutation: true`.
- Candidate regexes stay in React form state only; they are not put in URLs, localStorage, sessionStorage, custom token stores, or logs.
- The frontend does not run JavaScript `RegExp` against candidate patterns and does not provide a client-side match preview.
- Attempt feedback renders only aggregate counts: positive matched/total, negative matched/total, attempt number, solved status, and date.
- The frontend does not render secret regexes, hidden controls, `Attempt.proposedPattern`, password hashes, session hashes, raw tokens, or cookie values.
- `401`, `403`, `404`, `409`, and `422` attempt errors map to safe user-facing messages without stack traces or raw response bodies.

Frontend challenge authoring UI decisions:

- `/create` shows login/register CTAs to guests and does not render authoring fields.
- Authenticated users submit challenge creation through the existing same-origin API client with `credentials: "include"`.
- Challenge creation sets `X-RegexRiddle-CSRF: 1` through `protectedMutation: true`.
- The UI sends only the documented creation DTO fields: title, description, difficulty, secret regex, flags, public examples, and controls.
- The author is never accepted from the browser; the backend derives it from the server-side session.
- Client validation covers shape and UX constraints only. Server validation remains authoritative for regex syntax, RE2 compatibility, and example/control coherence.
- Secret regexes and secret controls stay in React form state only; they are not put in URLs, localStorage, sessionStorage, custom token stores, or logs.
- The frontend does not run JavaScript `RegExp` against the secret regex and does not provide a client-side match preview.
- Successful creation resets secret form inputs and renders only the public challenge detail DTO.
- `400`, `401`, `403`, and `422` creation errors map to safe user-facing messages without stack traces or raw response bodies.

Account settings decisions:

- `/account` shows login/register CTAs to guests and does not render settings fields without a current user.
- Authenticated account updates use `PATCH /api/auth/me`.
- The route derives the user only from the server-side `rr_session`; there is no route id and no client-provided user id.
- Account updates require `Content-Type: application/json` and `X-RegexRiddle-CSRF: 1`.
- The backend accepts only `displayName`, `bio`, and `avatarUrl`.
- Unknown keys and mass-assignment keys such as `id`, `username`, `email`, `password`, hashes, dates, relation names, and `_count` are rejected before Prisma writes.
- `bio` and `avatarUrl` empty strings normalize to `null`.
- Non-empty `avatarUrl` must be `http://` or `https://`; the server stores the URL string and does not fetch external avatar URLs.
- The account UI may show the authenticated user's own email as read-only data, but the app shell, public challenge author DTOs, and public leaderboard DTOs do not expose email or avatar URL.
- Account state stays in TanStack Query memory only. The frontend does not read `document.cookie` and does not store auth tokens or account secrets in `localStorage` or `sessionStorage`.
- No profile statistics, password change, email change, avatar file upload, upload storage, challenge edit/delete, JWT, auth/session semantic change, or regex behavior change is introduced.

Frontend auth UI decisions:

- `/login` sends only `usernameOrEmail` and `password` to `POST /api/auth/login`.
- `/register` sends only `username`, `email`, `password`, and `displayName` to `POST /api/auth/register`.
- `confirmPassword` exists only for frontend validation and is not sent to the backend.
- Logout calls `POST /api/auth/logout` and clears the in-memory current-user query state.
- Session restoration calls `GET /api/auth/me`; `401 Unauthorized` is treated as guest state.
- Header and mobile navigation display `displayName` and `username` only. Email is not shown in the shell.
- Login failures show a generic message and do not reveal whether username/email or password failed.
- Duplicate registration failures show a generic username/email conflict message.
- Passwords are never logged, never placed in URLs, and never persisted outside the password input and request body.
- The frontend does not read raw cookies, does not expose raw cookie values, and does not expose session tokens.
- The auth UI does not render `User.passwordHash`, `Session.sessionTokenHash`, raw tokens, or cookie values.

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

Public API tests and E2E tests include anti-leak assertions for forbidden response keys including `id`, `email`, `secretPattern`, `controls`, `value`, `proposedPattern`, `passwordHash`, `sessionTokenHash`, `token`, and `sessionToken` where those fields are forbidden by the endpoint contract.

Frontend auth tests and E2E tests include anti-leak assertions for rendered sensitive strings, no browser auth-token storage, no `document.cookie` auth access in production frontend source, and no frontend JavaScript `RegExp` evaluation for user regex.

CSRF guard v1 is implemented for protected cookie-authenticated product writes. Future protected mutations must reuse or strengthen this guard before release.

## Future review checklist

- XSS checks for UI rendering.
- CSRF checks for cookie-authenticated mutations.
- SQL injection protection through parameterized ORM queries.
- SSRF review before adding any outbound fetch feature.
- Path traversal review before file upload or export features.
