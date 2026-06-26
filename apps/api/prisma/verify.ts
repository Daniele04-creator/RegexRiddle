import { prisma } from "../src/db/prisma.js";

const expectedDemoUsernames = ["demo_creator", "demo_player", "daniele_demo"];

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const [users, challengeCount, controlGroups, attemptCount, solutionCount] =
    await Promise.all([
      prisma.user.findMany({
        where: { username: { in: expectedDemoUsernames } },
        select: { username: true }
      }),
      prisma.challenge.count(),
      prisma.challengeControl.groupBy({
        by: ["challengeId", "kind"],
        _count: { _all: true }
      }),
      prisma.attempt.count(),
      prisma.solution.count()
    ]);

  const foundUsernames = new Set(users.map((user) => user.username));

  for (const username of expectedDemoUsernames) {
    assertCondition(foundUsernames.has(username), `Missing demo user ${username}.`);
  }

  assertCondition(challengeCount >= 8, "Expected at least 8 seeded challenges.");
  assertCondition(attemptCount > 0, "Expected seeded attempts.");
  assertCondition(solutionCount > 0, "Expected seeded solutions.");

  const positiveChallengeIds = new Set<string>();
  const negativeChallengeIds = new Set<string>();

  for (const group of controlGroups) {
    if (group._count._all < 1) {
      continue;
    }

    if (group.kind === "POSITIVE") {
      positiveChallengeIds.add(group.challengeId);
    }

    if (group.kind === "NEGATIVE") {
      negativeChallengeIds.add(group.challengeId);
    }
  }

  assertCondition(
    positiveChallengeIds.size === challengeCount,
    "Every challenge must have at least one positive control."
  );
  assertCondition(
    negativeChallengeIds.size === challengeCount,
    "Every challenge must have at least one negative control."
  );

  const controlCount = await prisma.challengeControl.count();

  console.log("RegexRiddle database verification passed.");
  console.log(
    `users=${users.length} challenges=${challengeCount} controls=${controlCount} attempts=${attemptCount} solutions=${solutionCount}`
  );
  console.log("No secret patterns or secret control values were printed.");
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
