import { FlaskConicalIcon } from "lucide-react";
import { Link, NavLink } from "react-router";

import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { publicNavItems } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/86 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="RegexRiddle home"
          className="flex min-w-0 items-center gap-2 font-semibold text-foreground"
          to="/"
        >
          <span className="flex size-9 items-center justify-center rounded-lg border bg-card text-primary">
            <FlaskConicalIcon aria-hidden="true" />
          </span>
          <span className="truncate">RegexRiddle</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild size="sm">
            <Link to="/challenges">Gioca ora</Link>
          </Button>
          <UserMenu />
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
