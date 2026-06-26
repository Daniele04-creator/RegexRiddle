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

## Future endpoints

The following areas are intentionally TODO after GOAL 02:

- Authentication.
- Attempt submission.
- Leaderboard.
- Admin or authoring workflows.

Future protected routes must include authorization checks and must not expose secret regexes or secret controls.
