import { useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function ChallengeDetailPlaceholderPage() {
  const { challengeId } = useParams();

  return (
    <PlaceholderLayout
      badge="Attempt UI later"
      description="The challenge detail UI will later fetch public challenge data and submit attempts to the backend. GOAL 08.0 keeps this page as a safe placeholder."
      title="Challenge detail"
    >
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Route parameter: <span className="font-mono text-foreground">{challengeId ?? "unknown"}</span>
        </p>
        <p>
          Attempt submission is not implemented here. Secret regexes and secret
          control values remain server-only.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">No secret regex</Badge>
          <Badge variant="outline">No hidden checks</Badge>
          <Badge variant="outline">No submitted pattern echo</Badge>
        </div>
      </div>
    </PlaceholderLayout>
  );
}
