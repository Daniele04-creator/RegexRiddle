import type { AttemptSubmissionResponseDTO } from "@regexriddle/shared";
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AttemptProgressMeter } from "@/features/attempts/components/AttemptProgressMeter";
import { formatAttemptDate } from "@/features/attempts/format";

interface AttemptFeedbackCardProps {
  response: AttemptSubmissionResponseDTO;
}

export function AttemptFeedbackCard({ response }: AttemptFeedbackCardProps) {
  const { attempt } = response;
  const isCorrect = response.solved || attempt.isCorrect;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        aria-live="polite"
        className={isCorrect ? "border-lab-success/60" : "border-lab-warning/70"}
        role="status"
      >
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isCorrect ? "default" : "secondary"}>
              Tentativo #{attempt.attemptNumber}
            </Badge>
            <Badge variant="outline">{formatAttemptDate(attempt.createdAt)}</Badge>
          </div>
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2Icon
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-lab-success"
              />
            ) : (
              <CircleAlertIcon
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-lab-warning"
              />
            )}
            <div>
              <CardTitle className="text-xl">
                {isCorrect ? "Soluzione corretta" : "Non ancora"}
              </CardTitle>
              <CardDescription className="mt-1">
                {isCorrect
                  ? "Hai risolto la sfida. La classifica ti aspetta."
                  : `Hai superato ${attempt.positiveMatched} prove utili su ${attempt.positiveTotal}; restano ${attempt.negativeMatched} falsi positivi da eliminare su ${attempt.negativeTotal}.`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <AttemptProgressMeter
            label="Prove utili superate"
            matched={attempt.positiveMatched}
            tone="positive"
            total={attempt.positiveTotal}
          />
          <AttemptProgressMeter
            label="Falsi positivi rimasti"
            matched={attempt.negativeMatched}
            tone="negative"
            total={attempt.negativeTotal}
          />
          <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
            Le prove nascoste restano chiuse: usa questi indizi per affinare la
            prossima regex.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
