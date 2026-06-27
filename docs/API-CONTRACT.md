# API Contract

## GET /health

Returns basic service health metadata.

Response `200 application/json`:

```json
{
  "status": "ok",
  "service": "regexriddle-api",
  "appName": "RegexRiddle",
  "environment": "development"
}
```

## GOAL 01 note

GOAL 01 added the database layer only. It did not add public domain endpoints and did not expose `secretPattern` or `ChallengeControl.value`.

## GET /api/challenges

Returns a paginated list of public challenge catalog items. This endpoint is read-only and does not require authentication.

Query parameters:

- `page`: optional positive integer from `1` to `1000`. Default: `1`.
- `limit`: optional positive integer from `1` to `50`. Default: `20`.

Unknown query parameters are rejected. Prisma `include`, `select`, `where`, or other arbitrary query controls are not accepted from clients.

Response `200 application/json`:

```json
{
  "items": [
    {
      "id": "aaaaaaaa-0001-4000-8000-000000000001",
      "title": "Solo cifre",
      "description": "Accetta solo stringhe composte da una o piu' cifre.",
      "difficulty": "EASY",
      "author": {
        "username": "demo_creator",
        "displayName": "Demo Creator"
      },
      "publicPositiveExample": "12345",
      "publicNegativeExample": "abc123",
      "createdAt": "2026-06-26T22:21:48.000Z",
      "stats": {
        "attemptsTotal": 1,
        "solutionsTotal": 1
      }
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 10
}
```

Errors:

- `400 Bad Request`: invalid `page`, invalid `limit`, or unsupported query parameter.

## GET /api/challenges/:id

Returns the public detail for one challenge. This endpoint is read-only and does not require authentication.

Route parameters:

- `id`: required UUID.

Response `200 application/json`:

```json
{
  "id": "aaaaaaaa-0001-4000-8000-000000000001",
  "title": "Solo cifre",
  "description": "Accetta solo stringhe composte da una o piu' cifre.",
  "difficulty": "EASY",
  "author": {
    "username": "demo_creator",
    "displayName": "Demo Creator"
  },
  "publicPositiveExample": "12345",
  "publicNegativeExample": "abc123",
  "createdAt": "2026-06-26T22:21:48.000Z",
  "updatedAt": "2026-06-26T22:21:48.000Z",
  "stats": {
    "attemptsTotal": 1,
    "solutionsTotal": 1
  }
}
```

Errors:

- `400 Bad Request`: invalid UUID.
- `404 Not Found`: challenge does not exist.

Public challenge responses never include:

- `Challenge.secretPattern`
- `ChallengeControl.value`
- secret challenge control lists
- `Attempt.proposedPattern`
- user password or session hashes

## GET /api/leaderboard

Returns the public solver leaderboard. This endpoint is read-only and does not require authentication or CSRF.

Query parameters:

- `page`: optional positive integer from `1` to `1000`. Default: `1`.
- `limit`: optional positive integer from `1` to `50`. Default: `20`.

Unknown query parameters are rejected. Prisma `include`, `select`, `where`, `orderBy`, or other arbitrary query controls are not accepted from clients.

Leaderboard metrics:

- `solvedCount`: number of `Solution` rows for the user.
- `averageAttempts`: arithmetic average of `Solution.attemptsUsed`, rounded to 2 decimals.
- `totalAttemptsUsed`: sum of `Solution.attemptsUsed`.
- Users with zero solved challenges are excluded.
- `rank` is the 1-based global position after sorting, not a dense rank.

Ranking order:

1. `solvedCount` descending.
2. `averageAttempts` ascending.
3. `user.username` ascending.

Response `200 application/json`:

```json
{
  "items": [
    {
      "rank": 1,
      "user": {
        "username": "demo_player",
        "displayName": "Demo Player"
      },
      "solvedCount": 3,
      "averageAttempts": 1.67,
      "totalAttemptsUsed": 5
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Errors:

- `400 Bad Request`: invalid `page`, invalid `limit`, or unsupported query parameter.

Leaderboard responses never include:

- user ids
- user emails
- avatar URLs
- `Challenge.secretPattern`
- `ChallengeControl.value`
- control lists
- `Attempt.proposedPattern`
- `User.passwordHash`
- `Session.sessionTokenHash`
- raw session tokens or cookie values

## POST /api/challenges

Creates a challenge for the authenticated user. This endpoint is protected and state-changing. No frontend authoring UI is implemented yet.

Authentication and mutation guard:

- Requires a valid `rr_session` cookie.
- Requires `Content-Type: application/json`.
- Requires `X-RegexRiddle-CSRF: 1`.
- Missing, invalid, or expired auth returns `401 Unauthorized`.
- Missing or wrong CSRF header returns `403 Forbidden`.
- Non-JSON content type returns the existing JSON mutation guard response: `400 Bad Request`.

Request `application/json`:

```json
{
  "title": "Italian postal codes",
  "description": "Create a regex that matches valid five-digit Italian postal codes.",
  "difficulty": "EASY",
  "secretPattern": "\\d{5}",
  "flags": "",
  "publicPositiveExample": "80125",
  "publicNegativeExample": "8012A",
  "controls": [
    { "kind": "POSITIVE", "value": "00100" },
    { "kind": "POSITIVE", "value": "20121" },
    { "kind": "POSITIVE", "value": "99999" },
    { "kind": "NEGATIVE", "value": "1234" },
    { "kind": "NEGATIVE", "value": "ABCDE" },
    { "kind": "NEGATIVE", "value": "123456" }
  ]
}
```

Validation:

- Unknown top-level keys are rejected, including mass-assignment fields such as `authorId`, `id`, `_count`, `createdAt`, `updatedAt`, and `secretControls`.
- `title`: required string, trimmed, 3-100 characters.
- `description`: required string, trimmed, 20-1000 characters.
- `difficulty`: `EASY`, `MEDIUM`, or `HARD`.
- `secretPattern`: required string, trimmed, 1-300 characters.
- `flags`: optional string, default `""`; engine-supported flags are `i` and `m`, with duplicates rejected.
- `publicPositiveExample` and `publicNegativeExample`: required strings, 1-200 characters.
- `controls`: required array, at most 30 items.
- At least 3 `POSITIVE` and 3 `NEGATIVE` controls are required.
- Duplicate controls within the same kind are rejected.
- The same value cannot appear as both `POSITIVE` and `NEGATIVE`.
- The secret regex, public examples, and secret controls are validated server-side with the RE2-compatible full-match engine before persistence.

Response `201 application/json`:

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "title": "Italian postal codes",
  "description": "Create a regex that matches valid five-digit Italian postal codes.",
  "difficulty": "EASY",
  "author": {
    "username": "demo_player",
    "displayName": "Demo Player"
  },
  "publicPositiveExample": "80125",
  "publicNegativeExample": "8012A",
  "createdAt": "2026-06-27T12:00:00.000Z",
  "updatedAt": "2026-06-27T12:00:00.000Z",
  "stats": {
    "attemptsTotal": 0,
    "solutionsTotal": 0
  }
}
```

The response includes `Location: /api/challenges/:id`.

Errors:

- `400 Bad Request`: invalid body shape, invalid field types, unknown fields, duplicate controls, contradictory controls, or too few controls.
- `401 Unauthorized`: missing, invalid, or expired session.
- `403 Forbidden`: missing or wrong CSRF header.
- `422 Unprocessable Entity`: secret regex or flags are invalid/unsupported, or examples/controls are incoherent with the secret regex.

Challenge creation responses never include:

- `Challenge.secretPattern`
- `ChallengeControl.value`
- secret challenge control lists
- `Attempt.proposedPattern`
- `User.passwordHash`
- `Session.sessionTokenHash`
- raw session tokens or cookie values

## POST /api/challenges/:id/attempts

Submits a candidate regex for a challenge. This endpoint is protected and state-changing.

Route parameters:

- `id`: required UUID.

Authentication and mutation guard:

- Requires a valid `rr_session` cookie.
- Requires `Content-Type: application/json`.
- Requires `X-RegexRiddle-CSRF: 1`.
- Missing, invalid, or expired auth returns `401 Unauthorized`.
- Missing or wrong CSRF header returns `403 Forbidden`.
- Non-JSON content type returns `400 Bad Request`.

Request `application/json`:

```json
{
  "pattern": "\\d+",
  "flags": ""
}
```

Validation:

- `pattern`: required string, max 256 characters.
- `flags`: optional string, default `""`; only safe regex engine flags are accepted.
- Unknown request body keys are rejected.
- Clients cannot pass `userId`, `challengeId`, counts, `isCorrect`, or `attemptNumber`.

Response `201 application/json`:

```json
{
  "attempt": {
    "id": "bbbbbbbb-1000-4000-8000-000000000001",
    "challengeId": "aaaaaaaa-0006-4000-8000-000000000006",
    "attemptNumber": 1,
    "positiveMatched": 3,
    "positiveTotal": 3,
    "negativeMatched": 0,
    "negativeTotal": 3,
    "isCorrect": true,
    "createdAt": "2026-06-27T12:00:00.000Z"
  },
  "solved": true
}
```

Aggregate semantics:

- `positiveMatched`: number of POSITIVE secret controls matched by the submitted regex.
- `positiveTotal`: total POSITIVE secret controls.
- `negativeMatched`: number of NEGATIVE secret controls matched by the submitted regex.
- `negativeTotal`: total NEGATIVE secret controls.
- `isCorrect`: `positiveMatched === positiveTotal && negativeMatched === 0`.

Errors:

- `400 Bad Request`: invalid UUID, invalid body, unknown body keys, or non-JSON content type.
- `401 Unauthorized`: missing, invalid, or expired session.
- `403 Forbidden`: missing CSRF header or the current user is the challenge author.
- `404 Not Found`: challenge does not exist.
- `409 Conflict`: current user already solved the challenge.
- `422 Unprocessable Entity`: submitted regex is syntactically invalid or RE2-incompatible.

Attempt responses never include:

- `Challenge.secretPattern`
- `ChallengeControl.value`
- secret challenge control lists
- `Attempt.proposedPattern`
- `User.passwordHash`
- `Session.sessionTokenHash`
- raw session tokens or cookie values

## POST /api/auth/register

Creates a user, creates a server-side session, sets the `rr_session` cookie, and returns the public user. This endpoint does not return the session token in JSON.

Request `application/json`:

```json
{
  "username": "student_demo",
  "email": "student_demo@example.test",
  "password": "Password123!",
  "displayName": "Student Demo"
}
```

Validation:

- `username`: 3-32 lowercase letters, numbers, or underscores after normalization.
- `email`: valid email shape, normalized lowercase.
- `password`: 8-128 characters, at least one letter and one number.
- `displayName`: 1-80 characters after trimming.

Response `201 application/json`:

```json
{
  "user": {
    "id": "44444444-4444-4444-8444-444444444444",
    "username": "student_demo",
    "email": "student_demo@example.test",
    "displayName": "Student Demo",
    "createdAt": "2026-06-27T10:00:00.000Z"
  }
}
```

Cookie:

```text
Set-Cookie: rr_session=<opaque-token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Expires=<date>
```

Errors:

- `400 Bad Request`: invalid payload.
- `409 Conflict`: username or email already exists.

## POST /api/auth/login

Verifies credentials with Argon2id, creates a new server-side session, sets the `rr_session` cookie, and returns the public user.

Request `application/json`:

```json
{
  "usernameOrEmail": "demo_player",
  "password": "Password123!"
}
```

Response `200 application/json`:

```json
{
  "user": {
    "id": "22222222-2222-4222-8222-222222222222",
    "username": "demo_player",
    "email": "demo_player@example.test",
    "displayName": "Demo Player",
    "createdAt": "2026-06-27T10:00:00.000Z"
  }
}
```

Errors:

- `400 Bad Request`: invalid payload.
- `401 Unauthorized`: invalid credentials. The message is generic and does not reveal whether username/email or password is wrong.

## POST /api/auth/logout

Reads the `rr_session` cookie, deletes the matching server-side session if present, clears the cookie, and returns success even when no valid session exists.

Response `200 application/json`:

```json
{
  "success": true
}
```

Cookie clearing:

```text
Set-Cookie: rr_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

## GET /api/auth/me

Reads the `rr_session` cookie, checks for a valid non-expired server-side session, and returns the public user.

Response `200 application/json`:

```json
{
  "user": {
    "id": "22222222-2222-4222-8222-222222222222",
    "username": "demo_player",
    "email": "demo_player@example.test",
    "displayName": "Demo Player",
    "createdAt": "2026-06-27T10:00:00.000Z"
  }
}
```

Errors:

- `401 Unauthorized`: missing, invalid, or expired session.

Auth responses never include:

- `User.passwordHash`
- `Session.sessionTokenHash`
- raw session token
- cookie value in JSON

## Future endpoints

The following areas are intentionally TODO after GOAL 07:

- Challenge edit/delete workflows.
- Frontend authoring UI.
- Frontend leaderboard UI.

Future protected routes must include authorization checks and must not expose secret regexes or secret controls.
