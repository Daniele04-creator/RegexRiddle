import { LockKeyholeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function LoginPage() {
  return (
    <PlaceholderLayout
      badge="Auth UI later"
      description="The future login UI will use the HttpOnly rr_session cookie issued by the backend. It will not store browser-readable auth tokens."
      title="Login"
    >
      <div className="grid max-w-md gap-4">
        <div className="grid gap-2">
          <Label htmlFor="future-login">Username or email</Label>
          <Input
            autoComplete="username"
            disabled
            id="future-login"
            name="usernameOrEmail"
            placeholder="demo_player…"
            spellCheck={false}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="future-password">Password</Label>
          <Input
            autoComplete="current-password"
            disabled
            id="future-password"
            name="password"
            placeholder="Password123!…"
            type="password"
          />
        </div>
        <Button disabled>
          <LockKeyholeIcon aria-hidden="true" data-icon="inline-start" />
          Login UI not active yet
        </Button>
      </div>
    </PlaceholderLayout>
  );
}
