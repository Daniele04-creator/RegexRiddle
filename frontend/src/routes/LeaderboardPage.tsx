import { TrophyIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function LeaderboardPage() {
  return (
    <PlaceholderLayout
      badge="Leaderboard foundation"
      description="The leaderboard UI will connect to GET /api/leaderboard in GOAL 08.1. This milestone does not fetch or render real leaderboard rows."
      title="Solver leaderboard"
    >
      <div className="rounded-lg border bg-background/72 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
            <TrophyIcon aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">Ranking contract already exists in the backend.</p>
            <p className="text-sm text-muted-foreground">
              Sort by solved challenges, average attempts, then username.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">rank</Badge>
          <Badge variant="secondary">solvedCount</Badge>
          <Badge variant="secondary">averageAttempts</Badge>
          <Badge variant="secondary">totalAttemptsUsed</Badge>
        </div>
      </div>
    </PlaceholderLayout>
  );
}
