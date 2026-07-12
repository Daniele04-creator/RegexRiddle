import { pathToFileURL } from "node:url";

import { hashPassword } from "../src/features/auth/auth.service.js";
import { prisma } from "../src/core/db/prisma.js";

export const DEMO_PASSWORD = "Password123!";

export const DEMO_USERS = {
  chiara: {
    id: "11111111-1111-4111-8111-111111111111",
    username: "chiara_rossi"
  },
  luca: {
    id: "22222222-2222-4222-8222-222222222222",
    username: "luca_bianchi"
  },
  davide: {
    id: "33333333-3333-4333-8333-333333333333",
    username: "davide_mancini"
  }
} as const;

export const DEMO_CHALLENGE_IDS = {
  email: "aaaaaaaa-0001-4000-8000-000000000001",
  pin: "aaaaaaaa-0002-4000-8000-000000000002",
  practiceCode: "aaaaaaaa-0003-4000-8000-000000000003",
  hashtag: "aaaaaaaa-0004-4000-8000-000000000004",
  licensePlate: "aaaaaaaa-0005-4000-8000-000000000005",
  urlPath: "aaaaaaaa-0006-4000-8000-000000000006",
  time24Hours: "aaaaaaaa-0007-4000-8000-000000000007",
  romanNumeral: "aaaaaaaa-0008-4000-8000-000000000008"
} as const;

interface DemoChallengeSeed {
  id: string;
  authorId: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  publicPositiveExample: string;
  publicNegativeExample: string;
  controls: Array<{ kind: "POSITIVE" | "NEGATIVE"; value: string }>;
}

const demoChallengeSeeds: DemoChallengeSeed[] = [
  {
    id: DEMO_CHALLENGE_IDS.email,
    authorId: DEMO_USERS.chiara.id,
    title: "Validatore email aziendale",
    description:
      "Riconosci indirizzi email validi senza rivelare il pattern originale.",
    difficulty: "EASY",
    publicPositiveExample: "nome.cognome@azienda.it",
    publicNegativeExample: "utente@gmail",
    controls: [
      { kind: "POSITIVE", value: "nome.cognome@azienda.it" },
      { kind: "POSITIVE", value: "mario.rossi@esempio.it" },
      { kind: "POSITIVE", value: "a@b.it" },
      { kind: "POSITIVE", value: "squadra-1@regex.it" },
      { kind: "POSITIVE", value: "utente.nome+etichetta@prova.it" },
      { kind: "NEGATIVE", value: "testo-semplice" },
      { kind: "NEGATIVE", value: "utente@gmail" },
      { kind: "NEGATIVE", value: "@azienda.it" },
      { kind: "NEGATIVE", value: "utente@" },
      { kind: "NEGATIVE", value: "utente azienda.it" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.pin,
    authorId: DEMO_USERS.davide.id,
    title: "PIN numerico",
    description: "Trova il formato di un PIN composto da sole cifre.",
    difficulty: "EASY",
    publicPositiveExample: "1234",
    publicNegativeExample: "12A4",
    controls: [
      { kind: "POSITIVE", value: "0000" },
      { kind: "POSITIVE", value: "9876" },
      { kind: "NEGATIVE", value: "123" },
      { kind: "NEGATIVE", value: "12345" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.practiceCode,
    authorId: DEMO_USERS.chiara.id,
    title: "Codice pratica",
    description: "Indovina il prefisso alfabetico seguito da tre cifre.",
    difficulty: "MEDIUM",
    publicPositiveExample: "AB123",
    publicNegativeExample: "A1234",
    controls: [
      { kind: "POSITIVE", value: "RT001" },
      { kind: "POSITIVE", value: "ZX999" },
      { kind: "NEGATIVE", value: "rt001" },
      { kind: "NEGATIVE", value: "ABC12" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.hashtag,
    authorId: DEMO_USERS.davide.id,
    title: "Hashtag semplice",
    description: "Riconosci hashtag brevi con lettere e numeri.",
    difficulty: "EASY",
    publicPositiveExample: "#Regex2026",
    publicNegativeExample: "Regex2026",
    controls: [
      { kind: "POSITIVE", value: "#sviluppo_web" },
      { kind: "POSITIVE", value: "#A123" },
      { kind: "NEGATIVE", value: "#no" },
      { kind: "NEGATIVE", value: "etichetta_test" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.licensePlate,
    authorId: DEMO_USERS.chiara.id,
    title: "Targa compatta",
    description: "Trova il formato essenziale di una targa italiana moderna.",
    difficulty: "MEDIUM",
    publicPositiveExample: "AB123CD",
    publicNegativeExample: "ABC123D",
    controls: [
      { kind: "POSITIVE", value: "ZZ999YY" },
      { kind: "POSITIVE", value: "AA000BB" },
      { kind: "NEGATIVE", value: "A123BCD" },
      { kind: "NEGATIVE", value: "AA00BBB" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.urlPath,
    authorId: DEMO_USERS.davide.id,
    title: "Percorso URL semplice",
    description: "Accetta testi minuscoli separati da trattini singoli.",
    difficulty: "MEDIUM",
    publicPositiveExample: "sfida-regex-2026",
    publicNegativeExample: "-sfida-regex",
    controls: [
      { kind: "POSITIVE", value: "ciao-mondo" },
      { kind: "POSITIVE", value: "articolo-123" },
      { kind: "POSITIVE", value: "sfida-regex-divertente" },
      { kind: "POSITIVE", value: "regex2026" },
      { kind: "POSITIVE", value: "web-tecnologie-25" },
      { kind: "NEGATIVE", value: "-trattino-iniziale" },
      { kind: "NEGATIVE", value: "trattino-finale-" },
      { kind: "NEGATIVE", value: "doppio--trattino" },
      { kind: "NEGATIVE", value: "Maiuscole-No" },
      { kind: "NEGATIVE", value: "spazio non valido" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.time24Hours,
    authorId: DEMO_USERS.chiara.id,
    title: "Orario 24 ore",
    description: "Riconosci orari nel formato HH:MM.",
    difficulty: "HARD",
    publicPositiveExample: "09:30",
    publicNegativeExample: "25:30",
    controls: [
      { kind: "POSITIVE", value: "00:00" },
      { kind: "POSITIVE", value: "23:59" },
      { kind: "POSITIVE", value: "09:05" },
      { kind: "POSITIVE", value: "12:30" },
      { kind: "POSITIVE", value: "18:45" },
      { kind: "NEGATIVE", value: "24:00" },
      { kind: "NEGATIVE", value: "12:60" },
      { kind: "NEGATIVE", value: "1430" },
      { kind: "NEGATIVE", value: "99:99" },
      { kind: "NEGATIVE", value: "7:30" }
    ]
  },
  {
    id: DEMO_CHALLENGE_IDS.romanNumeral,
    authorId: DEMO_USERS.davide.id,
    title: "Numeri romani",
    description: "Individua una forma valida per numeri romani classici.",
    difficulty: "HARD",
    publicPositiveExample: "MCMXCIX",
    publicNegativeExample: "IIII",
    controls: [
      { kind: "POSITIVE", value: "I" },
      { kind: "POSITIVE", value: "XIV" },
      { kind: "POSITIVE", value: "MMXXVI" },
      { kind: "NEGATIVE", value: "IIII" },
      { kind: "NEGATIVE", value: "VV" },
      { kind: "NEGATIVE", value: "ABC" }
    ]
  }
];

export const ATTEMPT_CHALLENGE_CONTROL_VALUES = demoChallengeSeeds
  .find((challenge) => challenge.id === DEMO_CHALLENGE_IDS.urlPath)!
  .controls.map((control) => control.value);

export const CORRECT_CHALLENGE_CONTROL_VALUES = demoChallengeSeeds
  .find((challenge) => challenge.id === DEMO_CHALLENGE_IDS.time24Hours)!
  .controls.map((control) => control.value);

interface SuccessfulSolutionSeed {
  userId: string;
  challengeId: string;
  proposedPattern: string;
  positiveTotal: number;
  negativeTotal: number;
}

const successfulSolutionSeeds: SuccessfulSolutionSeed[] = [
  {
    userId: DEMO_USERS.davide.id,
    challengeId: DEMO_CHALLENGE_IDS.email,
    proposedPattern: String.raw`[^@\s]+@[^@\s]+\.[A-Za-z]{2,}`,
    positiveTotal: 5,
    negativeTotal: 5
  },
  {
    userId: DEMO_USERS.davide.id,
    challengeId: DEMO_CHALLENGE_IDS.practiceCode,
    proposedPattern: String.raw`[A-Z]{2}\d{3}`,
    positiveTotal: 2,
    negativeTotal: 2
  },
  {
    userId: DEMO_USERS.davide.id,
    challengeId: DEMO_CHALLENGE_IDS.licensePlate,
    proposedPattern: String.raw`[A-Z]{2}\d{3}[A-Z]{2}`,
    positiveTotal: 2,
    negativeTotal: 2
  },
  {
    userId: DEMO_USERS.davide.id,
    challengeId: DEMO_CHALLENGE_IDS.time24Hours,
    proposedPattern: String.raw`(?:[01]\d|2[0-3]):[0-5]\d`,
    positiveTotal: 5,
    negativeTotal: 5
  },
  {
    userId: DEMO_USERS.chiara.id,
    challengeId: DEMO_CHALLENGE_IDS.pin,
    proposedPattern: String.raw`\d{4}`,
    positiveTotal: 2,
    negativeTotal: 2
  },
  {
    userId: DEMO_USERS.chiara.id,
    challengeId: DEMO_CHALLENGE_IDS.hashtag,
    proposedPattern: String.raw`#[A-Za-z0-9_]{3,16}`,
    positiveTotal: 2,
    negativeTotal: 2
  },
  {
    userId: DEMO_USERS.chiara.id,
    challengeId: DEMO_CHALLENGE_IDS.romanNumeral,
    proposedPattern: String.raw`M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})`,
    positiveTotal: 3,
    negativeTotal: 3
  }
];

export async function seedDemoData(): Promise<void> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const demoUserIds = Object.values(DEMO_USERS).map((user) => user.id);
  const demoChallengeIds = Object.values(DEMO_CHALLENGE_IDS);

  await prisma.$transaction(async (tx) => {
    for (const user of Object.values(DEMO_USERS)) {
      await tx.user.upsert({
        where: { id: user.id },
        update: {
          avatarUrl: null,
          passwordHash,
          username: user.username
        },
        create: {
          ...user,
          avatarUrl: null,
          passwordHash
        }
      });
    }

    for (const challenge of demoChallengeSeeds) {
      const challengeData = {
        authorId: challenge.authorId,
        description: challenge.description,
        difficulty: challenge.difficulty,
        publicNegativeExample: challenge.publicNegativeExample,
        publicPositiveExample: challenge.publicPositiveExample,
        title: challenge.title
      };

      await tx.challenge.upsert({
        where: { id: challenge.id },
        update: challengeData,
        create: {
          id: challenge.id,
          ...challengeData
        }
      });
    }

    await tx.challengeControl.deleteMany({
      where: { challengeId: { in: demoChallengeIds } }
    });
    await tx.challengeControl.createMany({
      data: demoChallengeSeeds.flatMap((challenge) =>
        challenge.controls.map((control) => ({
          challengeId: challenge.id,
          kind: control.kind,
          value: control.value
        }))
      )
    });
    await tx.solution.deleteMany({
      where: {
        challengeId: { in: demoChallengeIds },
        userId: { in: demoUserIds }
      }
    });
    await tx.attempt.deleteMany({
      where: {
        challengeId: { in: demoChallengeIds },
        userId: { in: demoUserIds }
      }
    });
    await tx.attempt.createMany({
      data: [
        {
          userId: DEMO_USERS.luca.id,
          challengeId: DEMO_CHALLENGE_IDS.email,
          proposedPattern: ".*",
          positiveMatched: 5,
          positiveTotal: 5,
          negativeMatched: 5,
          negativeTotal: 5,
          isCorrect: false,
          attemptNumber: 1
        },
        {
          userId: DEMO_USERS.luca.id,
          challengeId: DEMO_CHALLENGE_IDS.email,
          proposedPattern: String.raw`[^@\s]+@[^@\s]+\.[A-Za-z]{2,}`,
          positiveMatched: 5,
          positiveTotal: 5,
          negativeMatched: 0,
          negativeTotal: 5,
          isCorrect: true,
          attemptNumber: 2
        },
        ...successfulSolutionSeeds.map((solution) => ({
          userId: solution.userId,
          challengeId: solution.challengeId,
          proposedPattern: solution.proposedPattern,
          positiveMatched: solution.positiveTotal,
          positiveTotal: solution.positiveTotal,
          negativeMatched: 0,
          negativeTotal: solution.negativeTotal,
          isCorrect: true,
          attemptNumber: 1
        }))
      ]
    });
    await tx.solution.createMany({
      data: [
        {
          userId: DEMO_USERS.luca.id,
          challengeId: DEMO_CHALLENGE_IDS.email,
          attemptsUsed: 2
        },
        ...successfulSolutionSeeds.map((solution) => ({
          userId: solution.userId,
          challengeId: solution.challengeId,
          attemptsUsed: 1
        }))
      ]
    });
  });
}

const entryPoint = process.argv[1];

if (
  entryPoint !== undefined &&
  import.meta.url === pathToFileURL(entryPoint).href
) {
  try {
    await seedDemoData();
  } finally {
    await prisma.$disconnect();
  }
}
