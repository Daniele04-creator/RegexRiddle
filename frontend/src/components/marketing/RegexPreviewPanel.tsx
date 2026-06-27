import { CheckIcon, ServerIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const checks = [
  { label: "AA123", state: "match" },
  { label: "XY777", state: "match" },
  { label: "123AA", state: "miss" },
  { label: "secret checks", state: "hidden" }
] as const;

export function RegexPreviewPanel() {
  return (
    <div
      aria-label="Regex Lab visual preview"
      className="relative overflow-hidden rounded-lg border bg-card p-4 shadow-2xl shadow-primary/10"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-lab-success" />
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Lab console</p>
          <p className="text-xs text-muted-foreground">Public examples only</p>
        </div>
        <Badge variant="secondary">
          <ServerIcon aria-hidden="true" data-icon="inline-start" />
          RE2 server
        </Badge>
      </div>

      <div className="mt-4 rounded-lg bg-background/90 p-3 font-mono text-sm">
        <span className="text-muted-foreground">candidate:</span>{" "}
        <span className="font-semibold text-foreground">[A-Z]&#123;2&#125;[0-9]&#123;3&#125;</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div
            className="flex items-center justify-between rounded-lg border bg-background/90 px-3 py-2 text-sm text-foreground"
            key={check.label}
          >
            <span className="font-mono">{check.label}</span>
            {check.state === "match" ? (
              <Badge className="bg-[var(--lab-success)] text-primary-foreground">
                <CheckIcon aria-hidden="true" data-icon="inline-start" />
                match
              </Badge>
            ) : null}
            {check.state === "miss" ? (
              <Badge variant="outline">
                <XIcon aria-hidden="true" data-icon="inline-start" />
                reject
              </Badge>
            ) : null}
            {check.state === "hidden" ? <Badge variant="secondary">server-only</Badge> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
