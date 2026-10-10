# RegexRiddle

Progetto di Tecnologie Web 2025/2026, traccia RegexRiddle, di Daniele De Blasio
(matricola N86005238). Il back-end Fastify espone un'API REST; il front-end
Angular è una Single Page Application responsive. Non sono utilizzati CMS.

## Funzionamento

La landing e la pagina «Come funziona» sono pubbliche. Dopo registrazione e
accesso si possono personalizzare username e avatar, creare sfide e risolvere
quelle degli altri utenti. L'autore non può tentare la propria sfida.

Ogni sfida richiede una regex valida, un esempio positivo e uno negativo pubblici,
e da 1 a 10 controlli positivi e da 1 a 10 negativi, tutti distinti. Il server
verifica che esempi e controlli siano coerenti prima della pubblicazione.
I controlli rimangono riservati: nelle risposte API compaiono solo i conteggi.
La regex originale è usata per questa convalida e non viene memorizzata:
le etichette dei controlli conservano il comportamento atteso.

Il motore RE2-WASM valuta la **corrispondenza dell'intera stringa**, anche con
alternative e quantificatori lazy. Si inserisce il pattern senza delimitatori
`/…/`: per esempio `a|ab`, `[0-9]+`, `(?i)abc`. Si applica la
[sintassi RE2](https://github.com/google/re2/wiki/Syntax): lookaround e
backreference non sono supportati. Un pattern invalido è rifiutato e non conta
come tentativo. Dopo ogni tentativo valido il feedback mostra entrambi i numeri
di stringhe **soddisfatte**: una soluzione corretta soddisfa tutti i positivi e
zero negativi. Non è richiesta uguaglianza testuale con la regex dell'autore.

Le statistiche e le soluzioni del profilo si aggiornano nella stessa sessione.
La classifica mostra i primi 100 giocatori con almeno una soluzione, ordinati
per enigmi risolti decrescenti, poi media dei tentativi sulle sfide risolte
crescente; lo username rende deterministici i pareggi completi.
Il catalogo è paginato, dal più recente, senza troncare le sfide oltre la
centesima. `GET /api/challenges` accetta `difficulty=EASY|MEDIUM|HARD`, `page`
(default 1) e `pageSize` (default 24, massimo 100); restituisce `items`, `total`,
`page`, `pageSize`, `totalPages`. Il cambio di filtro torna alla prima pagina.

## Requisiti

Installare:

- Node.js `>=24.14.0`
- pnpm `>=11.7.0`
- Docker Desktop, oppure un server PostgreSQL già disponibile

Verificare le versioni:

```powershell
node --version
pnpm --version
docker --version
docker compose version
```

## 1. Installazione delle dipendenze

Aprire PowerShell nella directory principale `RegexRiddle` ed eseguire:

```powershell
pnpm install --frozen-lockfile
```

Il comando installa le dipendenze dei package `backend`, `frontend`, `shared` ed
`e2e` definiti nel workspace pnpm.

## 2. Configurazione dell'ambiente

Creare i file locali partendo da `.env.example`:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example backend/.env
```

La configurazione di esempio usa:

- PostgreSQL su `127.0.0.1:55432`
- back-end su `127.0.0.1:4000`
- front-end locale su `127.0.0.1:5173`

## 3. Preparazione del database

Avviare PostgreSQL tramite Docker:

```powershell
docker compose up -d db
```

Attendere che il container `regexriddle-db` risulti disponibile, quindi
generare Prisma Client, applicare le migrazioni e inserire i dati dimostrativi:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Il seed prepara utenti, sfide, tentativi, soluzioni e classifica necessari per
la demo. Usarlo su un database dedicato al progetto.

Con PostgreSQL installato senza Docker, creare un database vuoto, configurare
`DATABASE_URL` in `.env` e `backend/.env` con host, porta, utente e password
effettivi, quindi eseguire gli stessi comandi Prisma. Non occorre il container
`db`. Per applicare solo le migrazioni già versionate si può usare
`pnpm --dir backend exec prisma migrate deploy`.

## 4. Avvio del back-end

Dal terminale aperto nella directory principale eseguire:

```powershell
pnpm dev:backend
```

Il server Fastify viene avviato su:

```text
http://127.0.0.1:4000
```

Per verificare che il back-end sia disponibile, aprire:

```text
http://127.0.0.1:4000/health
```

Lasciare questo terminale aperto durante l'utilizzo dell'applicazione.

## 5. Avvio del front-end

Aprire un secondo terminale nella directory principale ed eseguire:

```powershell
pnpm dev:frontend
```

La Single Page Application Angular viene avviata su:

```text
http://127.0.0.1:5173
```

Durante lo sviluppo, il proxy Angular inoltra automaticamente le richieste
`/api` e `/health` al back-end in esecuzione sulla porta `4000`.

## 6. Account dimostrativi

Tutti gli account creati dal seed usano la password `Password123!`.

| Username | Password |
| --- | --- |
| `chiara_rossi` | `Password123!` |
| `luca_bianchi` | `Password123!` |
| `davide_mancini` | `Password123!` |

## Avvio alternativo con Docker Compose

In alternativa all'avvio locale, è possibile eseguire database, migrazioni,
back-end e front-end tramite Docker.

Assicurarsi che nella directory principale esista il file `.env`, quindi
eseguire:

```powershell
docker compose up --build -d
```

Al primo avvio inserire i dati dimostrativi nel database Docker:

```powershell
docker compose run --rm migrate pnpm --dir backend db:seed
```

Aprire l'applicazione all'indirizzo:

```text
http://127.0.0.1:5174
```

In questa modalità il back-end rimane interno alla rete Docker ed è raggiunto
dal proxy del front-end.

Per visualizzare lo stato dei container:

```powershell
docker compose ps
```

Per arrestare l'intero stack:

```powershell
docker compose down
```

Per eliminare anche il volume PostgreSQL e tutti i dati locali:

```powershell
docker compose down -v
```

## Verifiche ripetibili

Con dipendenze installate e PostgreSQL raggiungibile tramite `DATABASE_URL`:

```powershell
pnpm --dir e2e exec playwright install chromium
pnpm check
```

`check` esegue audit delle dipendenze, generazione Prisma e controllo TypeScript
di tutti i package, build, test unitari e 20 test E2E su Chromium. Per eseguire
singole parti: `pnpm audit`, `pnpm typecheck`, `pnpm build`, `pnpm test:unit`,
`pnpm e2e`. Il rapporto E2E JSON è in `e2e/test-results/results.json`.

I test avviano automaticamente back-end e front-end. Le porte 4000 e 5173 devono
essere libere; si possono scegliere altre porte con `API_PORT` e `WEB_PORT`.
Usare un database dedicato alle verifiche. La suite genera uno schema nuovo
`e2e_<uuid>` a ogni esecuzione, applica le migrazioni con `migrate deploy` e
inserisce il seed: non azzera schemi né modifica `public`. L'utente PostgreSQL
deve poter creare schemi nel database. Gli schemi di prova rimangono disponibili
per ispezione; si possono eliminare successivamente dal database di test.
Una prova con `public` vuoto verifica anche che la classifica usi lo stesso
schema delle altre operazioni.

Le regressioni coprono matching completo, invalidità e coerenza delle regex,
limiti dei controlli, segretezza delle risposte, autorizzazione, feedback,
statistiche senza reload, persistenza dell'avatar, ordinamento della classifica,
oltre 100 sfide e layout a 320 px con spazio riservato alla scrollbar.
La prova responsive comprende anche username di 32 caratteri, titoli di 100,
descrizioni di 1000 ed esempi di 200, senza spazi. I test unitari verificano
anche flag, newline, Unicode, quote RE2 e parametri della paginazione.
`pnpm audit` non ignora segnalazioni e include le dipendenze
di sviluppo. Due override circoscritti in `pnpm-workspace.yaml` aggiornano
dipendenze ancora fissate da Prisma; vanno rimossi quando Prisma incorpora
versioni corrette. L'override `deepmerge-ts` passa alla versione 8 per la
[correzione di sicurezza](https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx):
la configurazione Prisma usa oggetti semplici, senza le API modificate nella
[release 8](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0).
Le versioni risolte sono riproducibili dal lockfile.

## Efficienza del codice

Il catalogo usa indici su `(createdAt DESC, id DESC)` e su
`(difficulty, createdAt DESC, id DESC)` per la paginazione ordinata.
L'indice singolo sulla difficoltà è stato sostituito da quello composito;
la prima colonna copre anche i filtri sulla sola difficoltà.
La migrazione `20261010000000_catalog_order_indexes` conserva i dati e viene
applicata con le altre migrazioni. Su un database già avviato:

```powershell
pnpm --dir backend exec prisma migrate deploy
```

La creazione degli indici può bloccare temporaneamente le scritture durante
la migrazione. Il comportamento degli indici segue la documentazione ufficiale
di PostgreSQL su [ordinamento](https://www.postgresql.org/docs/17/indexes-ordering.html)
e [indici multicolonna](https://www.postgresql.org/docs/17/indexes-multicolumn.html).
Una prova locale su 50.000 sfide sintetiche, con cache riscaldata, ha ridotto
la selezione della prima pagina da circa 18 ms a meno di 0,1 ms.
La misura riguarda la query, non la risposta HTTP completa: il conteggio
esatto del totale deve ancora visitare le righe pertinenti e gli offset elevati
richiedono di saltare le righe precedenti. Il conteggio filtrato ha mostrato
un piccolo aumento di costo, compensato dalla selezione più rapida della pagina.

La convalida di una nuova sfida interrompe i controlli al primo risultato
incompatibile; i tentativi esaminano sempre tutti i controlli per restituire
conteggi precisi. Il formatter italiano delle date viene creato una sola volta.
Restano la validazione separata della sintassi RE2 e i limiti di input, necessari
per la correttezza. Questi interventi non introducono dipendenze o cache di dati.

## Scheda del progetto

La scheda PDF nella directory principale contiene nome, cognome, matricola,
traccia e tecnologie in una pagina. I sorgenti sono separati in `backend/` e
`frontend/`; `shared/` contiene i contratti comuni ed `e2e/` i test.

Per rigenerare la scheda PDF dal sorgente modificabile:

```powershell
python -m pip install reportlab
python scripts/generate-project-sheet.py
```

## Risoluzione dei problemi

### Il back-end non si avvia

Verificare che:

- `backend/.env` esista;
- `DATABASE_URL` punti a PostgreSQL sulla porta `55432`;
- il container del database sia attivo con `docker compose ps`;
- le migrazioni siano state applicate con `pnpm db:migrate`.

### Il front-end non carica i dati

Verificare che il back-end sia attivo aprendo
`http://127.0.0.1:4000/health`. Se il back-end non risponde, riavviarlo con
`pnpm dev:backend`.

### Una porta è già occupata

Le porte predefinite sono:

- `5173` per il front-end locale;
- `5174` per il front-end Docker;
- `4000` per il back-end locale;
- `55432` per PostgreSQL.

Arrestare il processo o il container che sta usando la porta, quindi ripetere
il comando di avvio.
