import type { ChallengeDifficulty } from "@regexriddle/shared";

export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  switch (difficulty) {
    case "EASY":
      return "Facile";
    case "MEDIUM":
      return "Media";
    case "HARD":
      return "Difficile";
  }
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatPlural(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatAverageAttempts(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1
  }).format(value);
}
