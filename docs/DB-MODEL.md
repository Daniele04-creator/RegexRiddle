# Database Model

## GOAL 01 status

The initial Prisma/PostgreSQL model exists in `apps/api/prisma/schema.prisma` and is applied through a versioned migration.

## GOAL 02 status

Public challenge APIs read from this model through explicit Prisma selects and DTO serializers. They expose public challenge fields, public author display data, and aggregate attempt/solution counts only. They do not expose `Challenge.secretPattern`, `ChallengeControl.value`, or `Attempt.proposedPattern`.

## GOAL 03 status

Auth APIs use the existing `User` and `Session` models without a schema migration. User passwords are stored only as Argon2id hashes. Sessions store only `sessionTokenHash`; the raw session token exists only in the `rr_session` cookie.

## GOAL 04 status

The safe regex engine uses existing challenge, control, and attempt-shaped fields without a schema migration. It reads control values only internally and returns aggregate counts only.

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

### ChallengeControl

Fields: `id`, `challengeId`, `kind`, `value`, `createdAt`.

Unique constraints: `challengeId + kind + value`.

Security note: `value` is sensitive and must not be returned by public DTOs.

### Attempt

Fields: `id`, `userId`, `challengeId`, `proposedPattern`, `flags`, `positiveMatched`, `positiveTotal`, `negativeMatched`, `negativeTotal`, `isCorrect`, `attemptNumber`, `createdAt`.

Unique constraints: `userId + challengeId + attemptNumber`.

GOAL 01 stores demo attempt records only. It does not evaluate regexes.

### Solution

Fields: `id`, `userId`, `challengeId`, `attemptsUsed`, `solvedAt`.

Unique constraints: `userId + challengeId`.

The rule that authors cannot solve their own challenges will be enforced in service logic in a later goal.

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

Seed and verify logs print counts only, not secret patterns or secret control values.
