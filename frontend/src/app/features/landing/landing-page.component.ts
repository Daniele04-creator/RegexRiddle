import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  LucideChevronRight,
  LucideCircleCheck,
  LucideFlaskConical,
  LucideTerminal,
  LucideTrophy
} from "@lucide/angular";

import { AuthService } from "../../core/auth.service";

@Component({
  selector: "rr-landing-page",
  host: { class: "route-motion motion-in" },
  standalone: true,
  imports: [
    RouterLink,
    LucideChevronRight,
    LucideCircleCheck,
    LucideFlaskConical,
    LucideTerminal,
    LucideTrophy
  ],
  template: `
    <div class="page">
      <section class="hero-section">
        <div class="hero-grid"></div>
        <div class="hero-content">
          <div class="motion-in">
            <h1 class="hero-title" aria-label="REGEX RIDDLE">
              <span aria-hidden="true" class="gradient-regex desktop-title"
                >REGEX</span
              >
              <br />
              <span aria-hidden="true" class="gradient-riddle desktop-title"
                >RIDDLE</span
              >
            </h1>
            <p class="hero-copy">
              Crea sfide regex, risolvi gli enigmi degli altri e migliora il tuo
              posizionamento dimostrando padronanza sui pattern.
            </p>
            <div class="hero-actions">
              <a
                class="button primary large"
                [routerLink]="auth.user() ? '/challenges' : '/login'"
              >
                {{ auth.user() ? "Vai alle sfide" : "Accedi e gioca" }}
                <svg lucideChevronRight aria-hidden="true" [size]="17"></svg>
              </a>
            </div>
          </div>

          <div
            aria-label="Anteprima sfida RegexRiddle"
            class="terminal-demo challenge-preview motion-in delayed"
          >
            <div class="challenge-preview-top">
              <span class="diff easy">facile</span>
              <span class="preview-kicker">Sfida demo</span>
            </div>
            <div class="terminal-body challenge-preview-body">
              <div class="preview-title-row">
                <div>
                  <p class="code-label">Enigma pubblico</p>
                  <h2 class="preview-challenge-title">
                    Validatore email aziendale
                  </h2>
                </div>
                <span class="preview-hidden-pill">regex segreta</span>
              </div>

              <div
                class="preview-example-grid"
                aria-label="Esempi pubblici della sfida"
              >
                <div class="demo-string preview-example">
                  <span class="preview-example-label">Accetta</span>
                  <code>nome.cognome&#64;azienda.it</code>
                </div>
                <div class="demo-string preview-example">
                  <span class="preview-example-label">Rifiuta</span>
                  <code>utente&#64;gmail.com</code>
                </div>
              </div>

              <div>
                <p class="code-label">Tentativo del giocatore</p>
                <code class="code-chip"
                  >/^[a-z]+\\.[a-z]+&#64;azienda\\.it$/</code
                >
              </div>

              <div class="success-line preview-feedback">
                <svg lucideCircleCheck aria-hidden="true" [size]="16"></svg>
                <span>Feedback: 8/10 positivi e 9/10 negativi corretti</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section feature-section">
        <div class="feature-grid">
          <article class="feature-card violet motion-in">
            <div><svg lucideTerminal [size]="22"></svg></div>
            <h3>Crea un enigma</h3>
            <p>
              Definisci una regex segreta, condividi un esempio positivo e uno
              negativo, poi aggiungi controlli nascosti per la validazione.
            </p>
          </article>
          <article class="feature-card amber motion-in">
            <div><svg lucideFlaskConical [size]="22"></svg></div>
            <h3>Risolvi e migliora</h3>
            <p>
              Studia gli esempi, proponi una regex e ricevi solo conteggi
              aggregati sui controlli positivi e negativi.
            </p>
          </article>
          <article class="feature-card green motion-in">
            <div><svg lucideTrophy [size]="22"></svg></div>
            <h3>Scala la classifica</h3>
            <p>
              Guadagni posizioni per ogni sfida risolta. Meno tentativi
              migliorano il tuo piazzamento.
            </p>
          </article>
        </div>
      </section>
    </div>
  `
})
export class LandingPageComponent {
  readonly auth = inject(AuthService);
}
