import type { ChallengeDifficulty } from "@regexriddle/shared";

import { Badge } from "@/components/ui/badge";
import { getDifficultyLabel } from "@/features/challenges/format";

interface DifficultyBadgeProps {
  difficulty: ChallengeDifficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variant =
    difficulty === "HARD" ? "default" : difficulty === "MEDIUM" ? "secondary" : "outline";

  return <Badge variant={variant}>{getDifficultyLabel(difficulty)}</Badge>;
}
