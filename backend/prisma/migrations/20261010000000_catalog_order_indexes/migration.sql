BEGIN;

-- Match catalog pagination and filtered pagination without sorting all rows.
CREATE INDEX "challenges_createdAt_id_idx" ON "challenges"("createdAt" DESC, "id" DESC);
CREATE INDEX "challenges_difficulty_createdAt_id_idx" ON "challenges"("difficulty", "createdAt" DESC, "id" DESC);

-- The leading column of the composite index also covers difficulty lookups.
DROP INDEX "challenges_difficulty_idx";

COMMIT;
