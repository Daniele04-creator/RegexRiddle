import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { challengeDetailPath } from "@/app/router";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function ChallengesPage() {
  return (
    <PlaceholderLayout
      badge="Catalog foundation"
      description="The catalog UI will connect to GET /api/challenges in GOAL 08.1. This page currently documents the route, layout, and loading shape only."
      title="Challenge catalog"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div className="rounded-lg border bg-background/72 p-4" key={item}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-5 w-40" />
            <Skeleton className="mt-3 h-16 w-full" />
          </div>
        ))}
      </div>
      <Button asChild className="mt-6" variant="outline">
        <Link to={challengeDetailPath("preview")}>Apri placeholder dettaglio</Link>
      </Button>
    </PlaceholderLayout>
  );
}
