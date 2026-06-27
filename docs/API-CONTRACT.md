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

GOAL 04 adds no new public API endpoints. The safe regex engine is internal backend code only.

The following areas are intentionally TODO after GOAL 04:

- Attempt submission.
- Leaderboard.
- Admin or authoring workflows.

Future protected routes must include authorization checks and must not expose secret regexes or secret controls.
