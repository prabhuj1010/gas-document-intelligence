# GAS Document Intelligence (MVP)

A local-first web app (PWA) for PDF document intelligence. Users upload approved PDFs, review the extracted business fields, and ask questions in plain English. Each answer cites its PDF page or database record, or the app replies **"Not found in the approved sources."**

- **PostgreSQL + pgvector** is the system of record.
- **Ollama** runs the AI locally. The app calls **no external AI APIs**.
- **Cloudflare is optional and not set up.** The app runs fully on localhost/LAN.

> Use only synthetic or explicitly approved non-confidential documents during development.

**Status:** Day 1 of 7. The scaffold and health check work; uploads, extraction and chat aren't built yet. See [PROGRESS.md](PROGRESS.md) and [CLAUDE.md](CLAUDE.md) for the full plan.

## Architecture

```text
Browser / PWA (React + Vite, http://localhost:5173)
        |
        v
FastAPI (http://127.0.0.1:8000)  ──>  PostgreSQL 16 + pgvector (Docker, 127.0.0.1:5433)
        |
        └──>  Ollama (local, from Day 4)
```

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Docker Desktop (Windows/macOS) or Docker Engine + Compose (Linux) | Compose v2+ | Runs PostgreSQL only |
| Python | 3.11+ (3.12 tested) | Backend |
| Node.js | 20+ (24 tested) | Frontend |
| Ollama | from Day 4 | Run it directly on the host, not in Docker, to save memory |

## Local startup

### 1. Configure

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env` and set a strong `POSTGRES_PASSWORD`. `.env` is gitignored.

PostgreSQL is published on **127.0.0.1:5433**, because 5432 is often taken by other local installs. Change `POSTGRES_PORT` if 5433 is also busy.

### 2. Start the database

```bash
docker compose up -d
docker compose ps           # wait for "healthy"
```

The pgvector extension is created automatically the first time the data volume starts.

### 3. Run the backend (terminal 1)

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check it:
- Health: <http://127.0.0.1:8000/api/health> should report `"status":"ok"` and the pgvector version.
- API docs (OpenAPI): <http://127.0.0.1:8000/docs>

### 4. Run the frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The Dashboard shows live status for the API, the database and Ollama.

To point the frontend at a different API, create `frontend/.env.local` with `VITE_API_BASE_URL=http://host:port`, and add the frontend's origin to `CORS_ORIGINS` in `.env`.

### 5. Try the installable PWA

The service worker is only active in a production build:

```bash
cd frontend
npm run build
npm run preview             # serves dist/ on http://localhost:5173
```

In Chrome or Edge, use the install icon in the address bar.

## Checks

```bash
# Backend unit tests (no database needed)
cd backend && pytest

# Backend integration test (needs `docker compose up -d`)
cd backend && pytest -m integration

# Frontend lint + type-check + production build
cd frontend && npm run lint && npm run build
```

## Security defaults

- PostgreSQL listens on loopback only (`127.0.0.1`), and the API is started on `127.0.0.1`.
- CORS uses an explicit allow-list from `CORS_ORIGINS`. Wildcards are dropped.
- The service worker caches only the static app shell. It does no runtime caching of API responses, documents or chat answers.
- Secrets live in `.env` (gitignored). `.env.example` contains placeholders only.
- There is **no authentication yet**, so don't expose ports 8000, 5173 or 5433 beyond this machine or a trusted LAN.

## Project layout

```text
backend/            FastAPI app (app/), tests (tests/), requirements
database/init/      SQL run once when the database volume is created (pgvector)
frontend/           React + Vite + TypeScript PWA (src/pages: Dashboard, Upload, Documents, Chat)
docker-compose.yml  PostgreSQL 16 + pgvector
CLAUDE.md           Project instructions and full 7-day plan
PROGRESS.md         Completed work, blockers, next task
docs/               Daily completion reports (e.g. day-1-completion.md)
```

## Useful commands

```bash
docker compose stop          # stop the database (data kept)
docker compose down -v       # delete the database and its data volume (irreversible)
docker compose logs -f db    # database logs
```

## Limitations (current)

- No upload, extraction, search or chat yet. These arrive on Days 2–5.
- No authentication. Local and trusted-LAN use only.
- The dev machine has about 8 GB RAM and no NVIDIA GPU, so only small local models will be practical (chosen on Day 4).
