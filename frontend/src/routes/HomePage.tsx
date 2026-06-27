import {
  BrainCircuitIcon,
  CheckCircle2Icon,
  FlaskConicalIcon,
  LockKeyholeIcon,
  MessageSquareTextIcon,
  MousePointerClickIcon,
  PencilLineIcon,
  SearchIcon,
  TrophyIcon
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { HeroSection } from "@/components/marketing/HeroSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quickFlow = [
  {
    title: "Scegli una sfida",
    description: "Apri il catalogo e trova un enigma adatto al tuo ritmo.",
    icon: MousePointerClickIcon
  },
  {
    title: "Studia gli indizi",
    description: "Confronta esempi accettati e rifiutati prima di scrivere.",
    icon: SearchIcon
  },
  {
    title: "Prova la regex",
    description: "Invia un tentativo e misura quante prove hai superato.",
    icon: PencilLineIcon
  }
];

const funCards = [
  {
    title: "Pochi indizi, tanta logica",
    description:
      "Ogni enigma lascia abbastanza tracce per ragionare, ma non abbastanza per andare a caso.",
    icon: BrainCircuitIcon
  },
  {
    title: "Feedback dopo ogni tentativo",
    description:
      "Dopo una prova scopri quante stringhe giuste hai coperto e quanti falsi positivi hai lasciato passare.",
    icon: MessageSquareTextIcon
  },
  {
    title: "Sfida gli altri solver",
    description:
      "Risolvi piu enigmi con meno tentativi e sali nella classifica pubblica.",
    icon: TrophyIcon
  }
];

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PageContainer className="py-12 sm:py-16">
        <section aria-labelledby="flow-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline">Pronto in 5 secondi</Badge>
              <h2 id="flow-title" className="mt-3 text-3xl font-semibold">
                Dal primo indizio alla soluzione
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Scegli una sfida, leggi gli esempi pubblici, scrivi la tua regex
              e usa gli indizi per avvicinarti alla risposta.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickFlow.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                key={item.title}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                viewport={{ once: true, margin: "-80px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <FeatureCard {...item} />
              </motion.div>
            ))}
          </div>
        </section>

        <section aria-labelledby="fun-title" className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <Badge variant="secondary">
                <FlaskConicalIcon aria-hidden="true" data-icon="inline-start" />
                Perche e divertente
              </Badge>
              <h2 id="fun-title" className="mt-3 text-3xl font-semibold">
                Un gioco di deduzione, non una pagina di teoria
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Le prove nascoste impediscono scorciatoie: devi capire il
                pattern, non solo copiare gli esempi.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {funCards.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cta-title"
          className="mt-14 overflow-hidden rounded-lg border bg-card/82 p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="outline">
                <LockKeyholeIcon aria-hidden="true" data-icon="inline-start" />
                Prove nascoste
              </Badge>
              <h2 id="cta-title" className="mt-3 text-2xl font-semibold">
                Ogni soluzione deve superare tutto l'enigma
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                La tua regex deve coprire tutta la stringa e battere anche i
                casi che non vedi. Quando ci riesci, il risultato finisce in
                classifica.
              </p>
            </div>
            <Button asChild>
              <Link to="/challenges">
                <CheckCircle2Icon aria-hidden="true" data-icon="inline-start" />
                Trova una sfida
              </Link>
            </Button>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
