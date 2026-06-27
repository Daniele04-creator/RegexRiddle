import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface PlaceholderLayoutProps {
  badge: string;
  children: ReactNode;
  description: string;
  title: string;
}

export function PlaceholderLayout({
  badge,
  children,
  description,
  title
}: PlaceholderLayoutProps) {
  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">{badge}</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
      </div>
      <Card className="mt-8 bg-card/88">
        <CardHeader>
          <CardTitle>Percorsi disponibili</CardTitle>
          <CardDescription>
            Usa un percorso pubblico per rientrare nell'app senza esporre dati
            sensibili.
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </PageContainer>
  );
}
