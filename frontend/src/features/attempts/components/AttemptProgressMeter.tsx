import { cn } from "@/lib/utils";

interface AttemptProgressMeterProps {
  label: string;
  matched: number;
  total: number;
  tone: "positive" | "negative";
}

export function AttemptProgressMeter({
  label,
  matched,
  tone,
  total
}: AttemptProgressMeterProps) {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.max(0, (matched / safeTotal) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {matched}/{total}
        </span>
      </div>
      <div
        aria-label={`${label}: ${matched} su ${total}`}
        aria-valuemax={safeTotal}
        aria-valuemin={0}
        aria-valuenow={matched}
        aria-valuetext={`${matched} su ${total}`}
        className="h-2 rounded-full bg-muted"
        role="meter"
      >
        <div
          className={cn(
            "h-2 rounded-full transition-[width]",
            tone === "positive" ? "bg-emerald-500" : "bg-amber-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
