import { formatPlural } from "@/features/challenges/format";

interface ChallengeStatsProps {
  attemptsTotal: number;
  solutionsTotal: number;
}

export function ChallengeStats({
  attemptsTotal,
  solutionsTotal
}: ChallengeStatsProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div className="rounded-lg bg-muted/68 p-3">
        <dt className="text-muted-foreground">Tentativi</dt>
        <dd className="mt-1 font-semibold text-foreground">
          {formatPlural(attemptsTotal, "tentativo", "tentativi")}
        </dd>
      </div>
      <div className="rounded-lg bg-muted/68 p-3">
        <dt className="text-muted-foreground">Soluzioni</dt>
        <dd className="mt-1 font-semibold text-foreground">
          {formatPlural(solutionsTotal, "soluzione", "soluzioni")}
        </dd>
      </div>
    </dl>
  );
}
