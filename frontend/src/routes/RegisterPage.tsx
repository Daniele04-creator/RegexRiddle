import { UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderLayout } from "@/routes/PlaceholderLayout";

export function RegisterPage() {
  return (
    <PlaceholderLayout
      badge="Registration UI later"
      description="Registration endpoints exist in the backend, but this frontend milestone only prepares the accessible route and form layout primitives."
      title="Register"
    >
      <div className="grid max-w-md gap-4">
        <div className="grid gap-2">
          <Label htmlFor="future-register-username">Username</Label>
          <Input
            autoComplete="username"
            disabled
            id="future-register-username"
            name="username"
            placeholder="student_demo…"
            spellCheck={false}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="future-register-email">Email</Label>
          <Input
            autoComplete="email"
            disabled
            id="future-register-email"
            name="email"
            placeholder="student@example.test…"
            spellCheck={false}
            type="email"
          />
        </div>
        <Button disabled>
          <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
          Register UI not active yet
        </Button>
      </div>
    </PlaceholderLayout>
  );
}
