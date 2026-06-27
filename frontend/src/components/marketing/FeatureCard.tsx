import type { ComponentType, SVGProps } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface FeatureCardProps {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}

export function FeatureCard({ description, icon: Icon, title }: FeatureCardProps) {
  return (
    <Card className="bg-card/86">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted text-primary">
          <Icon aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-1 rounded-full bg-gradient-to-r from-primary via-accent to-transparent" />
      </CardContent>
    </Card>
  );
}
