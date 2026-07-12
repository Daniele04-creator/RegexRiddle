## Requisiti

Installare:

- Node.js `>=24.14.0`
- pnpm `>=11.7.0`
- Docker Desktop

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
pnpm install
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
la demo.

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
