import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { UserMenu } from "@/features/auth/components/UserMenu";
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
          <Separator className="my-2" />
          <UserMenu onNavigate={() => setOpen(false)} orientation="mobile" />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
