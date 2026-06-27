import { ConstructionIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function CreateChallengePage() {
  return (
    <PlaceholderLayout
      badge="Protected creation later"
      description="The future challenge creation UI will validate through the backend and RE2 full-match checks. GOAL 08.0 does not create challenges from the browser."
      title="Create a challenge"
    >
      <div className="grid max-w-2xl gap-4">
        <div className="grid gap-2">
          <Label htmlFor="future-title">Challenge title</Label>
          <Input
            autoComplete="off"
            disabled
            id="future-title"
            name="title"
            placeholder="Italian postal codes…"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="future-description">Description</Label>
          <Textarea
            autoComplete="off"
            disabled
            id="future-description"
            name="description"
            placeholder="Match valid five-digit postal codes…"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Secret patterns and secret control values will be submitted only to
          protected backend endpoints and will not be rendered back to solvers.
        </p>
        <Button disabled>
          <ConstructionIcon aria-hidden="true" data-icon="inline-start" />
          Creation UI not active yet
        </Button>
      </div>
    </PlaceholderLayout>
  );
}
