import { PanelComponent } from "../../shared/ui.components";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowLeft, LucideSparkles } from "@lucide/angular";
import { AuthService } from "../../core/auth.service";
import { TimelineStepComponent } from "./timeline-step.component";

@Component({
  selector: "rr-how-it-works-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    PanelComponent,
    TimelineStepComponent,
    LucideArrowLeft,
    LucideSparkles
  ],
  template: `
    <section class="how-page">
      <div class="how-heading motion-in">
        <a class="back-link" routerLink="/">
          <svg lucideArrowLeft aria-hidden="true" [size]="16"></svg>
          Torna alla home
        </a>
        <h1>Come funziona</h1>
        <p>Tutto quello che ti serve per iniziare a giocare a RegexRiddle.</p>
      </div>

      <div class="timeline">
        <rr-timeline-step
          icon="terminal"
          note="Le stringhe di controllo restano nascoste. I giocatori vedono solo i due esempi pubblici."
          step="01"
          text="L'autore scrive una regex segreta, inserisce un esempio positivo visibile e un esempio negativo visibile. Poi aggiunge da 1 a 10 controlli positivi e da 1 a 10 controlli negativi nascosti."
          title="L'autore crea un enigma"
        />
        <rr-timeline-step
          icon="info"
          note="La sfida consiste nel dedurre il pattern completo partendo da informazioni limitate."
          step="02"
          text="Chi gioca vede titolo, descrizione, un esempio accettato e un esempio rifiutato. La regex originale e tutti i controlli restano fuori dal client."
          title="Gli altri vedono solo esempi"
        />
        <rr-timeline-step
          icon="flask"
          note="Puoi fare piu tentativi: ogni proposta viene validata dal server."
          step="03"
          text="Il solver invia una regex candidata. Il sistema la esegue contro i controlli nascosti e calcola solo i conteggi aggregati."
          title="Invia una regex"
        />
        <rr-timeline-step
          icon="trend"
          note="I conteggi aggregati aiutano a restringere il pattern senza rivelare le stringhe segrete."
          step="04"
          text="Dopo ogni tentativo scopri quante stringhe positive hai accettato e quante negative hai correttamente escluso. Non vedi quali stringhe sono fallite."
          title="Leggi il feedback"
        />
        <rr-timeline-step
          icon="trophy"
          note="Risolvere con pochi tentativi migliora il piazzamento in classifica."
          step="05"
          text="Una sfida e risolta quando accetti il 100% dei controlli positivi e rifiuti il 100% dei negativi. A parita di enigmi risolti, conta la media tentativi piu bassa."
          title="Vinci con meno tentativi"
        />
      </div>

      @if (auth.user() === null) {
        <rr-panel className="center-panel how-cta">
          <svg lucideSparkles class="violet-text" [size]="34"></svg>
          <h2>Pronto a giocare?</h2>
          <p>Accedi o registrati per giocare e creare un enigma tutto tuo.</p>
          <div class="center-actions">
            <a class="button primary" routerLink="/login">Accedi</a>
            <a class="button outline" routerLink="/register">Registrati</a>
          </div>
        </rr-panel>
      }
    </section>
  `
})
export class HowItWorksPageComponent {
  readonly auth = inject(AuthService);
}
