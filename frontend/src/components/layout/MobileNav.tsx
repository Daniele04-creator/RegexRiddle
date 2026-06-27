import { MenuIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { publicNavItems } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button aria-label="Open navigation menu" className="lg:hidden" size="icon" variant="outline">
          <MenuIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[min(22rem,calc(100vw-2rem))] bg-card shadow-xl ring-1 ring-border/80"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>RegexRiddle</SheetTitle>
          <SheetDescription>Regex Lab navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-2 px-4">
          {publicNavItems.map((item) => (
            <SheetClose asChild key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                  )
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Button asChild className="mt-2 justify-start">
              <Link to="/create">
                <PlusIcon aria-hidden="true" data-icon="inline-start" />
                Crea · in arrivo
              </Link>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
