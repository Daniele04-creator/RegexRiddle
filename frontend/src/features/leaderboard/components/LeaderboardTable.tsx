import type { LeaderboardItemDTO } from "@regexriddle/shared";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatAverageAttempts } from "@/features/challenges/format";

interface LeaderboardTableProps {
  items: LeaderboardItemDTO[];
}

export function LeaderboardTable({ items }: LeaderboardTableProps) {
  return (
    <Table>
      <TableCaption>Classifica pubblica dei solver con metriche aggregate.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Rank</TableHead>
          <TableHead scope="col">Solver</TableHead>
          <TableHead className="text-right" scope="col">
            Sfide risolte
          </TableHead>
          <TableHead className="text-right" scope="col">
            Media tentativi
          </TableHead>
          <TableHead className="text-right" scope="col">
            Tentativi totali
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.user.username}>
            <TableCell className="font-semibold">#{item.rank}</TableCell>
            <TableCell>
              <span className="block font-medium">{item.user.displayName}</span>
              <span className="text-muted-foreground">@{item.user.username}</span>
            </TableCell>
            <TableCell className="text-right">{item.solvedCount}</TableCell>
            <TableCell className="text-right">
              {formatAverageAttempts(item.averageAttempts)}
            </TableCell>
            <TableCell className="text-right">{item.totalAttemptsUsed}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
