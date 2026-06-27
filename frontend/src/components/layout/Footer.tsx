import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-16">
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>RegexRiddle frontend foundation, GOAL 08.0.</p>
        <p>Server-side RE2 evaluation. HttpOnly cookie auth. No token storage.</p>
      </div>
    </footer>
  );
}
