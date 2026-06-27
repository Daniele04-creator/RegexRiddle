interface LeaderboardMetricProps {
  label: string;
  value: string;
}

export function LeaderboardMetric({ label, value }: LeaderboardMetricProps) {
  return (
    <div className="rounded-lg bg-muted/68 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
