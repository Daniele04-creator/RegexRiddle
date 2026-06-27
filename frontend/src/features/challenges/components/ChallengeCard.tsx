import type { ChallengeListItemDTO } from "@regexriddle/shared";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

import { challengeDetailPath } from "@/app/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChallengeExamples } from "@/features/challenges/components/ChallengeExamples";
import { ChallengeStats } from "@/features/challenges/components/ChallengeStats";
import { DifficultyBadge } from "@/features/challenges/components/DifficultyBadge";
import { formatDate } from "@/features/challenges/format";

interface ChallengeCardProps {
  challenge: ChallengeListItemDTO;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <Card className="h-full bg-card/90 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>
          <h2>{challenge.title}</h2>
        </CardTitle>
        <CardDescription>
          {challenge.author.displayName} @{challenge.author.username}
        </CardDescription>
        <CardAction>
          <DifficultyBadge difficulty={challenge.difficulty} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{challenge.description}</p>
        <ChallengeExamples
          negative={challenge.publicNegativeExample}
          positive={challenge.publicPositiveExample}
        />
        <ChallengeStats
          attemptsTotal={challenge.stats.attemptsTotal}
          solutionsTotal={challenge.stats.solutionsTotal}
        />
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Pubblicata il {formatDate(challenge.createdAt)}
        </p>
        <Button asChild variant="outline">
          <Link to={challengeDetailPath(challenge.id)}>
            Gioca
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
