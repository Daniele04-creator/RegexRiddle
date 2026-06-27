# Database Model

## GOAL 01 status

The initial Prisma/PostgreSQL model exists in `backend/prisma/schema.prisma` and is applied through a versioned migration.

## GOAL 02 status

Public challenge APIs read from this model through explicit Prisma selects and DTO serializers. They expose public challenge fields, public author display data, and aggregate attempt/solution counts only. They do not expose `Challenge.secretPattern`, `ChallengeControl.value`, or `Attempt.proposedPattern`.

## GOAL 03 status

Auth APIs use the existing `User` and `Session` models without a schema migration. User passwords are stored only as Argon2id hashes. Sessions store only `sessionTokenHash`; the raw session token exists only in the `rr_session` cookie.

## GOAL 04 status

The safe regex engine uses existing challenge, control, and attempt-shaped fields without a schema migration. It reads control values only internally and returns aggregate counts only.

## GOAL 05 status

Protected attempt submission uses the existing `Attempt` and `Solution` models without a schema migration. The service creates attempts only for the authenticated user, blocks authors from attempting their own challenges, blocks already solved challenge attempts, and creates one solution row when the submitted regex satisfies all positive controls and zero negative controls.

## GOAL 06 status

Protected challenge creation uses the existing `Challenge` and `ChallengeControl` models without a schema migration. The service creates both rows transactionally, sets `authorId` from the authenticated `rr_session` user, validates public examples and secret controls with the server-side RE2 full-match engine before writing, and returns only the public challenge detail DTO.

## GOAL 07 status

The public solver leaderboard uses the existing `Solution` and `User` models without a schema migration. It aggregates solution rows by user, computes solved counts, total attempts used, and average attempts used, then joins only public user identity fields for the response.

## Models

### User

Fields: `id`, `username`, `email`, `passwordHash`, `displayName`, optional `bio`, optional `avatarUrl`, `createdAt`, `updatedAt`.

Relations: sessions, authored challenges, attempts, solutions.

Unique constraints: `username`, `email`.

### Session

Fields: `id`, `sessionTokenHash`, `userId`, `expiresAt`, `createdAt`.

Unique constraints: `sessionTokenHash`.

Auth endpoints create and delete rows in this table. Expired sessions are rejected by `GET /api/auth/me` and can be removed during lookup.

### Challenge

Fields: `id`, `authorId`, `title`, `description`, `difficulty`, `secretPattern`, `flags`, `publicPositiveExample`, `publicNegativeExample`, `createdAt`, `updatedAt`.

Relations: author, controls, attempts, solutions.

Security note: `secretPattern` is sensitive and must not be returned by public DTOs.

GOAL 06 writes this model from `POST /api/challenges`; client-provided `authorId`, `id`, counts, and timestamps are rejected.

### ChallengeControl

Fields: `id`, `challengeId`, `kind`, `value`, `createdAt`.

Unique constraints: `challengeId + kind + value`.

Security note: `value` is sensitive and must not be returned by public DTOs.

GOAL 06 writes at least three positive and three negative controls for each created challenge. Duplicate controls within the same kind and contradictory positive/negative values are rejected before persistence.

### Attempt

Fields: `id`, `userId`, `challengeId`, `proposedPattern`, `flags`, `positiveMatched`, `positiveTotal`, `negativeMatched`, `negativeTotal`, `isCorrect`, `attemptNumber`, `createdAt`.

Unique constraints: `userId + challengeId + attemptNumber`.

Field semantics:

- `positiveMatched`: POSITIVE secret controls matched by the submitted regex.
- `positiveTotal`: total POSITIVE secret controls.
- `negativeMatched`: NEGATIVE secret controls matched by the submitted regex.
- `negativeTotal`: total NEGATIVE secret controls.
- `isCorrect`: `positiveMatched === positiveTotal && negativeMatched === 0`.
- `attemptNumber`: next number for the authenticated user and challenge.

`proposedPattern` is sensitive. It is stored for future private history/audit use but is not returned by the public attempt response.

### Solution

Fields: `id`, `userId`, `challengeId`, `attemptsUsed`, `solvedAt`.

Unique constraints: `userId + challengeId`.

GOAL 05 enforces the rule that authors cannot solve their own challenges in attempt service logic. A solution is created only once for `userId + challengeId`; after that, additional attempts return `409 Conflict`.

GOAL 07 reads this table for leaderboard aggregates. Users with no `Solution` rows are excluded from the public leaderboard.

## Enums

- `Difficulty`: `EASY`, `MEDIUM`, `HARD`.
- `ControlKind`: `POSITIVE`, `NEGATIVE`.

## Seed data

The deterministic seed creates:

- 3 demo users.
- 10 demo challenges.
- 60 challenge controls.
- 4 demo attempts.
- 2 demo solutions.

Seed demo attempts use the official GOAL 05 `negativeMatched` semantics. Correct demo attempts have `negativeMatched = 0`. Seed and verify logs print counts only, not secret patterns or secret control values.
