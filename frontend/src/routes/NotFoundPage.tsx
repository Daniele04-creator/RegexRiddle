import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function NotFoundPage() {
  return (
    <PlaceholderLayout
      badge="404"
      description="This route does not exist. The SPA fallback stays safe and sends users back to the public shell."
      title="Page not found"
    >
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </PlaceholderLayout>
  );
}
