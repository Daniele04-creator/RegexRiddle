# Difesa orale

## Cosa contiene GOAL 04

GOAL 04 aggiunge il motore regex sicuro server-side. Non c'e' ancora un endpoint pubblico per inviare tentativi, ma il backend ora ha funzioni testate per valutare regex candidate e controlli di sfida.

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
- motore regex interno basato su `re2-wasm`;
- semantica full match con ancore assolute RE2;
- documentazione iniziale per architettura, sicurezza, test e piano di sviluppo.

La API espone `GET /health`, due endpoint pubblici read-only sulle sfide e quattro endpoint auth backend. GOAL 04 non aggiunge endpoint pubblici nuovi.

## Perche' serve

Prima di implementare attempt submission, il progetto deve avere un motore sicuro per valutare regex senza esporre pattern segreti o controlli.

In GOAL 04 questi controlli devono passare: migration, seed, verify, lint, typecheck, unit test, build ed E2E. Docker Compose avvia PostgreSQL, API e web.

Prisma e' l'ORM: descriviamo le tabelle in TypeScript/Prisma schema, generiamo un client tipizzato e applichiamo le modifiche al database con migration versionate.

Il seed crea utenti e sfide demo ripetibili. Serve per provare il progetto e per l'orale, ma non sostituisce le feature vere.

## Cosa non contiene ancora

Non ci sono ancora frontend auth UI, creazione sfide da UI, endpoint attempt, leaderboard o UI di gioco.

Questa scelta e' intenzionale: GOAL 04 aggiunge solo il motore interno, senza rendere pubblici endpoint che gestiscono tentativi.

## Punto di sicurezza principale

Quando verra' implementata la valutazione delle regex, non bisogna usare `RegExp` JavaScript per input degli utenti. La valutazione dovra' essere server-side, con semantica full match e motore RE2-compatible.

I campi sensibili come pattern segreti e controlli segreti stanno nel database/backend. Il frontend vede solo dati pubblici; regex originale e controlli segreti restano nel database/server.

Gli endpoint di GOAL 02 usano DTO espliciti e select Prisma limitate. Le response pubbliche non contengono `secretPattern`, `ChallengeControl.value` o `Attempt.proposedPattern`.

Per l'autenticazione non usiamo JWT e non mettiamo token in `localStorage`. Il server genera un token opaco casuale, salva nel database solo il suo hash SHA-256 e invia il token in un cookie `rr_session` con `HttpOnly` e `SameSite=Lax`.

Le password sono salvate con Argon2id. Le API auth restituiscono solo l'utente pubblico e non espongono `passwordHash`, `sessionTokenHash`, token o valore del cookie.

Per le regex non usiamo `RegExp` JavaScript sui pattern utente. Usiamo RE2 tramite `re2-wasm`, che evita il backtracking esponenziale tipico dei casi ReDoS. Il match e' full-string: una soluzione deve coprire tutta la stringa di controllo, non solo una sottostringa.

Il motore restituisce solo conteggi aggregati come `positiveMatched`, `negativeMatched` e `isCorrect`. Non restituisce controlli segreti, regex segrete o pattern candidati.
