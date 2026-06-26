import { createHash } from "node:crypto";

import argon2 from "argon2";

import { prisma } from "../src/db/prisma.js";

const DEMO_PASSWORD = "Password123!";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type ControlKind = "POSITIVE" | "NEGATIVE";

interface DemoUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
}

interface DemoChallenge {
  id: string;
  authorId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  secretPattern: string;
  flags: string;
  publicPositiveExample: string;
  publicNegativeExample: string;
  positiveControls: string[];
  negativeControls: string[];
}

interface DemoAttempt {
  id: string;
  userId: string;
  challengeId: string;
  proposedPattern: string;
  flags: string;
  positiveMatched: number;
  negativeMatched: number;
  isCorrect: boolean;
  attemptNumber: number;
  createdAt: Date;
}

interface DemoSolution {
  id: string;
  userId: string;
  challengeId: string;
  attemptsUsed: number;
  solvedAt: Date;
}

const users = {
  creator: {
    id: "11111111-1111-4111-8111-111111111111",
    username: "demo_creator",
    email: "demo_creator@example.test",
    displayName: "Demo Creator",
    bio: "Demo author account for seeded RegexRiddle challenges."
  },
  player: {
    id: "22222222-2222-4222-8222-222222222222",
    username: "demo_player",
    email: "demo_player@example.test",
    displayName: "Demo Player",
    bio: "Demo solver account with solved and unsolved attempts."
  },
  daniele: {
    id: "33333333-3333-4333-8333-333333333333",
    username: "daniele_demo",
    email: "daniele_demo@example.test",
    displayName: "Daniele Demo",
    bio: "Demo account for oral-defense walkthroughs."
  }
} satisfies Record<string, DemoUser>;

const challenges: DemoChallenge[] = [
  {
    id: "aaaaaaaa-0001-4000-8000-000000000001",
    authorId: users.creator.id,
    title: "Solo cifre",
    description: "Match strings made only of one or more decimal digits.",
    difficulty: "EASY",
    secretPattern: "\\d+",
    flags: "",
    publicPositiveExample: "12345",
    publicNegativeExample: "abc123",
    positiveControls: ["0", "42", "987654"],
    negativeControls: ["", "12a", "abc"]
  },
  {
    id: "aaaaaaaa-0002-4000-8000-000000000002",
    authorId: users.creator.id,
    title: "Solo lettere minuscole",
    description: "Accept lowercase alphabetic strings only.",
    difficulty: "EASY",
    secretPattern: "[a-z]+",
    flags: "",
    publicPositiveExample: "regex",
    publicNegativeExample: "Regex",
    positiveControls: ["abc", "regex", "lab"],
    negativeControls: ["ABC", "abc1", ""]
  },
  {
    id: "aaaaaaaa-0003-4000-8000-000000000003",
    authorId: users.creator.id,
    title: "Hex color",
    description: "Accept six-digit CSS-like hexadecimal colors.",
    difficulty: "MEDIUM",
    secretPattern: "#[0-9a-fA-F]{6}",
    flags: "",
    publicPositiveExample: "#1a2B3c",
    publicNegativeExample: "1a2B3c",
    positiveControls: ["#000000", "#ffffff", "#A1b2C3"],
    negativeControls: ["#fff", "000000", "#12345g"]
  },
  {
    id: "aaaaaaaa-0004-4000-8000-000000000004",
    authorId: users.creator.id,
    title: "Data ISO",
    description: "Accept dates shaped like year-month-day without semantic date validation.",
    difficulty: "EASY",
    secretPattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: "",
    publicPositiveExample: "2026-06-27",
    publicNegativeExample: "27-06-2026",
    positiveControls: ["2024-01-01", "1999-12-31", "2026-06-27"],
    negativeControls: ["24-01-01", "2024/01/01", "2024-1-01"]
  },
  {
    id: "aaaaaaaa-0005-4000-8000-000000000005",
    authorId: users.creator.id,
    title: "Username valido",
    description: "Accept a letter followed by 2 to 15 letters, digits, or underscores.",
    difficulty: "MEDIUM",
    secretPattern: "[a-zA-Z][a-zA-Z0-9_]{2,15}",
    flags: "",
    publicPositiveExample: "Daniele_04",
    publicNegativeExample: "04Daniele",
    positiveControls: ["abc", "User_123", "RegexRiddle"],
    negativeControls: ["ab", "1abc", "name-with-dash"]
  },
  {
    id: "aaaaaaaa-0006-4000-8000-000000000006",
    authorId: users.daniele.id,
    title: "Codice prodotto",
    description: "Accept two uppercase letters, a dash, and four digits.",
    difficulty: "EASY",
    secretPattern: "[A-Z]{2}-\\d{4}",
    flags: "",
    publicPositiveExample: "AB-1234",
    publicNegativeExample: "A1-1234",
    positiveControls: ["AA-0000", "ZX-9876", "RR-2026"],
    negativeControls: ["aa-0000", "AAA-0000", "AB-123"]
  },
  {
    id: "aaaaaaaa-0007-4000-8000-000000000007",
    authorId: users.daniele.id,
    title: "Targa semplificata",
    description: "Accept a simplified Italian-style plate shape.",
    difficulty: "MEDIUM",
    secretPattern: "[A-Z]{2}\\d{3}[A-Z]{2}",
    flags: "",
    publicPositiveExample: "AB123CD",
    publicNegativeExample: "AB12CD",
    positiveControls: ["AA000AA", "ZZ999ZZ", "RG123EX"],
    negativeControls: ["AA00AA", "aa000aa", "AAA000A"]
  },
  {
    id: "aaaaaaaa-0008-4000-8000-000000000008",
    authorId: users.daniele.id,
    title: "Email semplificata",
    description: "Accept a simplified lowercase email format.",
    difficulty: "HARD",
    secretPattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}",
    flags: "",
    publicPositiveExample: "student@example.com",
    publicNegativeExample: "Student@example.com",
    positiveControls: ["a@b.it", "demo.user@example.com", "name+tag@test.dev"],
    negativeControls: ["Student@example.com", "missing-at.test", "a@b"]
  },
  {
    id: "aaaaaaaa-0009-4000-8000-000000000009",
    authorId: users.creator.id,
    title: "Versione semantica",
    description: "Accept three numeric version segments separated by dots.",
    difficulty: "EASY",
    secretPattern: "\\d+\\.\\d+\\.\\d+",
    flags: "",
    publicPositiveExample: "1.2.3",
    publicNegativeExample: "1.2",
    positiveControls: ["0.0.1", "10.20.30", "2026.6.27"],
    negativeControls: ["1.2", "v1.2.3", "1.2.x"]
  },
  {
    id: "aaaaaaaa-0010-4000-8000-000000000010",
    authorId: users.creator.id,
    title: "Slug URL",
    description: "Accept lowercase alphanumeric slug segments separated by single dashes.",
    difficulty: "HARD",
    secretPattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
    flags: "",
    publicPositiveExample: "regex-riddle-2026",
    publicNegativeExample: "-regex-riddle",
    positiveControls: ["regex", "regex-riddle", "webtech-2026"],
    negativeControls: ["Regex", "-regex", "regex--riddle"]
  }
];

const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

const attempts: DemoAttempt[] = [
  {
    id: "bbbbbbbb-0001-4000-8000-000000000001",
    userId: users.player.id,
    challengeId: challenges[0].id,
    proposedPattern: "\\d{2,}",
    flags: "",
    positiveMatched: 2,
    negativeMatched: 3,
    isCorrect: false,
    attemptNumber: 1,
    createdAt: new Date("2026-06-27T08:00:00.000Z")
  },
  {
    id: "bbbbbbbb-0002-4000-8000-000000000002",
    userId: users.player.id,
    challengeId: challenges[0].id,
    proposedPattern: "\\d+",
    flags: "",
    positiveMatched: 3,
    negativeMatched: 3,
    isCorrect: true,
    attemptNumber: 2,
    createdAt: new Date("2026-06-27T08:05:00.000Z")
  },
  {
    id: "bbbbbbbb-0003-4000-8000-000000000003",
    userId: users.daniele.id,
    challengeId: challenges[1].id,
    proposedPattern: "[a-z]+",
    flags: "",
    positiveMatched: 3,
    negativeMatched: 3,
    isCorrect: true,
    attemptNumber: 1,
    createdAt: new Date("2026-06-27T09:00:00.000Z")
  },
  {
    id: "bbbbbbbb-0004-4000-8000-000000000004",
    userId: users.player.id,
    challengeId: challenges[2].id,
    proposedPattern: "#[0-9a-f]{6}",
    flags: "",
    positiveMatched: 2,
    negativeMatched: 3,
    isCorrect: false,
    attemptNumber: 1,
    createdAt: new Date("2026-06-27T10:00:00.000Z")
  }
];

const solutions: DemoSolution[] = [
  {
    id: "cccccccc-0001-4000-8000-000000000001",
    userId: users.player.id,
    challengeId: challenges[0].id,
    attemptsUsed: 2,
    solvedAt: new Date("2026-06-27T08:06:00.000Z")
  },
  {
    id: "cccccccc-0002-4000-8000-000000000002",
    userId: users.daniele.id,
    challengeId: challenges[1].id,
    attemptsUsed: 1,
    solvedAt: new Date("2026-06-27T09:01:00.000Z")
  }
];

function stableSalt(username: string): Buffer {
  return createHash("sha256")
    .update(`regexriddle-demo-seed:${username}`)
    .digest()
    .subarray(0, 16);
}

async function hashDemoPassword(username: string): Promise<string> {
  return argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32,
    salt: stableSalt(username)
  });
}

function controlId(challengeId: string, kind: ControlKind, index: number): string {
  const suffix = kind === "POSITIVE" ? "1" : "2";
  const challengeNumber = challengeId.slice(-4);

  return `dddddddd-${challengeNumber}-${suffix}${String(index).padStart(3, "0")}-8000-000000000000`;
}

function totalsFor(challengeId: string): { positiveTotal: number; negativeTotal: number } {
  const challenge = challengeById.get(challengeId);

  if (challenge === undefined) {
    throw new Error("Attempt references an unknown demo challenge.");
  }

  return {
    positiveTotal: challenge.positiveControls.length,
    negativeTotal: challenge.negativeControls.length
  };
}

async function seedUsers(): Promise<void> {
  for (const user of Object.values(users)) {
    const passwordHash = await hashDemoPassword(user.username);

    await prisma.user.upsert({
      where: { username: user.username },
      create: {
        ...user,
        passwordHash
      },
      update: {
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: null,
        passwordHash
      }
    });
  }
}

async function seedChallenges(): Promise<void> {
  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { id: challenge.id },
      create: {
        id: challenge.id,
        authorId: challenge.authorId,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        secretPattern: challenge.secretPattern,
        flags: challenge.flags,
        publicPositiveExample: challenge.publicPositiveExample,
        publicNegativeExample: challenge.publicNegativeExample
      },
      update: {
        authorId: challenge.authorId,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        secretPattern: challenge.secretPattern,
        flags: challenge.flags,
        publicPositiveExample: challenge.publicPositiveExample,
        publicNegativeExample: challenge.publicNegativeExample
      }
    });

    for (const [index, value] of challenge.positiveControls.entries()) {
      await prisma.challengeControl.upsert({
        where: { id: controlId(challenge.id, "POSITIVE", index + 1) },
        create: {
          id: controlId(challenge.id, "POSITIVE", index + 1),
          challengeId: challenge.id,
          kind: "POSITIVE",
          value
        },
        update: {
          kind: "POSITIVE",
          value
        }
      });
    }

    for (const [index, value] of challenge.negativeControls.entries()) {
      await prisma.challengeControl.upsert({
        where: { id: controlId(challenge.id, "NEGATIVE", index + 1) },
        create: {
          id: controlId(challenge.id, "NEGATIVE", index + 1),
          challengeId: challenge.id,
          kind: "NEGATIVE",
          value
        },
        update: {
          kind: "NEGATIVE",
          value
        }
      });
    }
  }
}

async function seedAttempts(): Promise<void> {
  for (const attempt of attempts) {
    const totals = totalsFor(attempt.challengeId);

    await prisma.attempt.upsert({
      where: { id: attempt.id },
      create: {
        ...attempt,
        ...totals
      },
      update: {
        proposedPattern: attempt.proposedPattern,
        flags: attempt.flags,
        positiveMatched: attempt.positiveMatched,
        positiveTotal: totals.positiveTotal,
        negativeMatched: attempt.negativeMatched,
        negativeTotal: totals.negativeTotal,
        isCorrect: attempt.isCorrect,
        attemptNumber: attempt.attemptNumber,
        createdAt: attempt.createdAt
      }
    });
  }
}

async function seedSolutions(): Promise<void> {
  for (const solution of solutions) {
    await prisma.solution.upsert({
      where: { id: solution.id },
      create: solution,
      update: {
        attemptsUsed: solution.attemptsUsed,
        solvedAt: solution.solvedAt
      }
    });
  }
}

async function main(): Promise<void> {
  await seedUsers();
  await seedChallenges();
  await seedAttempts();
  await seedSolutions();

  const controlCount = challenges.reduce(
    (total, challenge) =>
      total + challenge.positiveControls.length + challenge.negativeControls.length,
    0
  );

  console.log("RegexRiddle demo seed completed.");
  console.log(
    `users=${Object.keys(users).length} challenges=${challenges.length} controls=${controlCount} attempts=${attempts.length} solutions=${solutions.length}`
  );
  console.log("No secret patterns or secret control values were printed.");
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
