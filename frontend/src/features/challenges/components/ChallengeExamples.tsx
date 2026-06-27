interface ChallengeExamplesProps {
  negative: string;
  positive: string;
}

export function ChallengeExamples({ negative, positive }: ChallengeExamplesProps) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div className="rounded-lg border bg-background/74 p-3">
        <dt className="font-medium text-muted-foreground">Esempio accettato</dt>
        <dd className="mt-2 min-w-0 break-words font-mono text-foreground">{positive}</dd>
      </div>
      <div className="rounded-lg border bg-background/74 p-3">
        <dt className="font-medium text-muted-foreground">Esempio rifiutato</dt>
        <dd className="mt-2 min-w-0 break-words font-mono text-foreground">{negative}</dd>
      </div>
    </dl>
  );
}
