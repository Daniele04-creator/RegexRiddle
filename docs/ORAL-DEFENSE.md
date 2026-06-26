# Difesa orale

## Cosa contiene GOAL 03

GOAL 03 aggiunge autenticazione backend con sessioni opache. Non c'e' ancora una UI di login, ma le API permettono registrazione, login, logout e lettura dell'utente corrente.

Il repository contiene:

- un monorepo `pnpm`;
- una SPA React in `apps/web`;
- una API Fastify in `apps/api`;
- test E2E Playwright in `apps/e2e`;
- un package condiviso in `packages/shared`;
- Docker Compose con web, API e PostgreSQL;
- Prisma come ORM nel backend;
- una migration iniziale versionata;
- un seed demo deterministico;
- API pubbliche `GET /api/challenges` e `GET /api/challenges/:id`;
- API auth `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`;
- DTO pubblici condivisi per catalogo e dettaglio sfida;
- DTO pubblici per utente autenticato;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone `GET /health`, due endpoint pubblici read-only sulle sfide e quattro endpoint auth backend. La pagina web mostra ancora `RegexRiddle`, quindi serve come smoke test visuale senza anticipare la UI finale.

## Perche' serve

Prima di implementare attempt submission e valutazione delle regex, il progetto deve avere una base verificabile di identita' utente: registrazione, login, logout e sessione corrente.

In GOAL 03 questi controlli devono passare: migration, seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora frontend auth UI, creazione sfide da UI, attempt engine, leaderboard o regex evaluation.

Questa scelta e' intenzionale: GOAL 03 aggiunge solo identita' backend e sessioni sicure, senza introdurre mutazioni di prodotto o valutazione regex troppo presto.

## Punto di sicurezza principale

Quando verra' implementata la valutazione delle regex, non bisogna usare `RegExp` JavaScript per input degli utenti. La valutazione dovra' essere server-side, con semantica full match e motore RE2-compatible.

I campi sensibili come pattern segreti e controlli segreti stanno nel database/backend. Il frontend vede solo dati pubblici; regex originale e controlli segreti restano nel database/server.

Gli endpoint di GOAL 02 usano DTO espliciti e select Prisma limitate. Le response pubbliche non contengono `secretPattern`, `ChallengeControl.value` o `Attempt.proposedPattern`.

Per l'autenticazione non usiamo JWT e non mettiamo token in `localStorage`. Il server genera un token opaco casuale, salva nel database solo il suo hash SHA-256 e invia il token in un cookie `rr_session` con `HttpOnly` e `SameSite=Lax`.

Le password sono salvate con Argon2id. Le API auth restituiscono solo l'utente pubblico e non espongono `passwordHash`, `sessionTokenHash`, token o valore del cookie.
