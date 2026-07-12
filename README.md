# RegexRiddle

RegexRiddle è una piattaforma web full-stack dedicata a sfide basate sulle
espressioni regolari. Gli utenti registrati possono creare enigmi con una regex
segreta, esempi pubblici e stringhe di controllo private. Gli altri utenti
propongono una propria regex e ricevono soltanto il numero di controlli positivi
e negativi superati, senza visualizzare la soluzione o i dati segreti.

## Tecnologie utilizzate

- Back-end: Node.js, TypeScript, Fastify, Prisma ORM e PostgreSQL.
- Sicurezza: Argon2id per le password, sessioni server-side con cookie
  `HttpOnly` e `SameSite`, RE2 tramite `re2-wasm` per valutare le regex.
- Front-end: Angular 21, TypeScript, Angular Router, Angular Forms, Signals,
  RxJS, HTML5 e CSS3 responsive.
- Test End-to-End: Playwright, con 5 scenari desktop e 5 scenari mobile.
- Esecuzione: workspace pnpm, Docker e Docker Compose.

## Struttura del progetto

```text
RegexRiddle/
|- backend/             API, autenticazione, logica applicativa e Prisma
|- frontend/            Single Page Application Angular
|- shared/              costanti, DTO e contratti condivisi
|- e2e/                 10 test End-to-End Playwright
|- docker-compose.yml   stack Docker completa
|- .env.example         configurazione locale di esempio
|- package.json         comandi principali del workspace
`- README.md            istruzioni del progetto
```

## Requisiti

- Node.js `>=24.14.0`
- pnpm `>=11.7.0`
- Docker Desktop, consigliato per PostgreSQL e necessario per avviare l'intero
  stack tramite Docker Compose

## Configurazione iniziale

Installare le dipendenze dalla directory principale:

```powershell
pnpm install
```

Creare i file di configurazione locale partendo dall'esempio:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example backend/.env
```

Il file `.env` nella root viene usato da Docker Compose e dai test E2E. Il file
`backend/.env` viene caricato quando il back-end viene avviato dalla propria
directory. Entrambi sono esclusi da Git e non devono contenere credenziali da
condividere o pubblicare.

## Avvio locale per lo sviluppo

Avviare PostgreSQL:

```powershell
docker compose up -d db
```

Generare Prisma Client, applicare le migrazioni e inserire i dati dimostrativi:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Avviare il back-end:

```powershell
pnpm dev:backend
```

In un secondo terminale avviare il front-end:

```powershell
pnpm dev:frontend
```

Indirizzi predefiniti:

- front-end: `http://127.0.0.1:5173`
- back-end: `http://127.0.0.1:4000`
- health check API: `http://127.0.0.1:4000/health`

Durante lo sviluppo Angular inoltra `/api` e `/health` al back-end tramite il
proxy configurato in `frontend/proxy.conf.cjs`.

## Avvio completo con Docker

Per compilare e avviare database, migrazioni, back-end e front-end:

```powershell
docker compose up --build -d
```

Al primo avvio, inserire i dati dimostrativi nel database Docker:

```powershell
docker compose run --rm migrate pnpm --dir backend db:seed
```

Aprire `http://127.0.0.1:5174`. Il back-end non è esposto direttamente
all'esterno della rete Compose: il front-end inoltra le richieste `/api` e
`/health` allo specifico servizio interno.

Per arrestare i container:

```powershell
docker compose down
```

Il comando seguente elimina anche il volume PostgreSQL e tutti i dati locali:

```powershell
docker compose down -v
```

## Account dimostrativi

Il seed crea tre utenti italiani con la stessa password:

| Username | Password |
| --- | --- |
| `chiara_rossi` | `Password123!` |
| `luca_bianchi` | `Password123!` |
| `davide_mancini` | `Password123!` |

Il database viene popolato anche con sfide, tentativi, soluzioni e dati della
classifica, in modo da rendere la demo riproducibile.

## Verifica del progetto

Controlli disponibili:

```powershell
pnpm typecheck
pnpm build
pnpm e2e
```

`pnpm test` è un alias di `pnpm e2e`.

Prima della consegna eseguire il controllo completo:

```powershell
pnpm check
```

Il comando esegue audit delle dipendenze, typecheck, build di tutti i package e
i 10 test End-to-End. Gli E2E usano uno schema PostgreSQL isolato denominato
`e2e`, ricreato e popolato automaticamente prima della suite.

## Sicurezza

- La regex originale e le stringhe di controllo non vengono restituite ai
  client.
- Le password vengono salvate esclusivamente come hash Argon2id.
- Le sessioni sono server-side e usano cookie opachi `HttpOnly` e `SameSite`.
- Le regex inserite dagli utenti vengono valutate lato server con RE2.
- Gli endpoint protetti richiedono autenticazione e validano gli input.
- Password, token, cookie, session ID e dati segreti delle sfide non devono
  essere inseriti nei log o nel repository.

