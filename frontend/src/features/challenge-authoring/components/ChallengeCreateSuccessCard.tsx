import type { ChallengeDetailDTO } from "@regexriddle/shared";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { challengeDetailPath } from "@/app/router";

interface ChallengeCreateSuccessCardProps {
  challenge: ChallengeDetailDTO;
}

export function ChallengeCreateSuccessCard({
  challenge
}: ChallengeCreateSuccessCardProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2Icon aria-hidden="true" />
          Sfida creata
        </CardTitle>
        <CardDescription>
          La sfida e' pronta: i solver vedranno solo titolo, descrizione e
          indizi pubblici.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div>
          <p className="font-medium text-foreground">{challenge.title}</p>
          <p className="mt-1 text-muted-foreground">{challenge.description}</p>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border bg-background/70 p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">
              Difficolta
            </dt>
            <dd className="mt-1">{challenge.difficulty}</dd>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">
              Esempio positivo
            </dt>
            <dd className="mt-1 break-all font-mono">{challenge.publicPositiveExample}</dd>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">
              Esempio negativo
            </dt>
            <dd className="mt-1 break-all font-mono">{challenge.publicNegativeExample}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link to={challengeDetailPath(challenge.id)}>
            Apri sfida
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
