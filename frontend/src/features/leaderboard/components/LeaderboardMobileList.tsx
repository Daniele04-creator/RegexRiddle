import type { LeaderboardItemDTO } from "@regexriddle/shared";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatAverageAttempts } from "@/features/challenges/format";
import { LeaderboardMetric } from "@/features/leaderboard/components/LeaderboardMetric";

interface LeaderboardMobileListProps {
  items: LeaderboardItemDTO[];
}

export function LeaderboardMobileList({ items }: LeaderboardMobileListProps) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.user.username}>
          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">#{item.rank}</Badge>
                {item.user.displayName}
              </CardTitle>
              <CardDescription>@{item.user.username}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-2">
                <LeaderboardMetric label="Risolte" value={String(item.solvedCount)} />
                <LeaderboardMetric
                  label="Media"
                  value={formatAverageAttempts(item.averageAttempts)}
                />
                <LeaderboardMetric
                  label="Totali"
                  value={String(item.totalAttemptsUsed)}
                />
              </dl>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}
