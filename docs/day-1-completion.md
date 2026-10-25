# Day 1 Completion Report: Project Scaffold

| | |
|---|---|
| **Project** | GAS Document Intelligence (MVP) |
| **Day** | 1 of 7 |
| **Date** | 2026-10-25 |
| **Status** | ✅ Complete. All Day 1 scope is delivered and verified. |
| **Repository** | https://github.com/prabhuj1010/gas-document-intelligence (`main`, Day 1 commit 18d4584) |

---

## 1. Objective

From CLAUDE.md §15:

> Create the repository skeleton, local Docker Compose PostgreSQL with pgvector, FastAPI `/api/health`, React/Vite/TypeScript PWA shell with routes for Dashboard/Upload/Documents/Chat, `.env.example`, and clear local startup steps in `README.md`. Run available checks. Do not integrate Cloudflare or paid/external AI services yet.

## 2. Scope delivered

| # | Deliverable | Status | Location |
|---|---|---|---|
| 1 | Git repository, `.gitignore` (excludes `.env`, `storage/`, `node_modules/`, `.venv/`) | ✅ | `/` |
| 2 | Project instructions saved to the repo | ✅ | `CLAUDE.md` |
| 3 | Environment template, plus a local `.env` with a random DB password (gitignored) | ✅ | `.env.example` |
| 4 | PostgreSQL 16 + pgvector via Docker Compose, loopback only | ✅ | `docker-compose.yml`, `database/init/001_extensions.sql` |
| 5 | FastAPI backend with `GET /api/health` and OpenAPI docs | ✅ | `backend/app/` |
| 6 | Backend tests (unit + integration) | ✅ | `backend/tests/test_health.py` |
| 7 | React + Vite + TypeScript PWA shell with 4 routes | ✅ | `frontend/src/` |
| 8 | PWA manifest, icons, app-shell-only service worker | ✅ | `frontend/vite.config.ts`, `frontend/public/` |
| 9 | README with Windows/macOS/Linux startup steps | ✅ | `README.md` |
| 10 | Progress tracker | ✅ | `PROGRESS.md` |

**Out of scope, as instructed:** Cloudflare, Ollama integration, any external or paid AI service.

## 3. Architecture as built

```text
Browser / PWA  (React + Vite)       http://localhost:5173
        |
        v
FastAPI                             http://127.0.0.1:8000
   |  GET /api/health
   v
PostgreSQL 16 + pgvector 0.8.7      127.0.0.1:5433 (Docker container gas-db-1)

Ollama: not configured yet (Day 4)
```

## 4. Components

### 4.1 Database
- **Image:** `pgvector/pgvector:pg16`
- **Container:** `gas-db-1`, data in Docker volume `gas_gas_pgdata`.
- **Port:** published on **127.0.0.1:5433** only.
  - Port 5432 was already taken by the `pias-postgres` container and a native PostgreSQL install.
- **Init:** `CREATE EXTENSION vector` runs once, when the volume is first created.
- **Tuning for an 8 GB machine:** `shared_buffers=128MB`, `max_connections=20`.
- **Healthcheck:** `pg_isready` every 5 s.
- **Schema:** no application tables yet. They arrive with the Day 2 migrations.

### 4.2 Backend (FastAPI)

| File | Purpose |
|---|---|
| `app/main.py` | App setup, CORS middleware (explicit allow-list, methods GET/POST/PATCH) |
| `app/config.py` | Settings from env, then `../.env`, then `backend/.env`. Wildcard `*` origins are dropped. |
| `app/db.py` | Connection helper and readiness check (connects, reads the pgvector version). Reports only the error class, never credentials. |
| `app/api/health.py` | `GET /api/health`, with an OpenAPI example and a 503 response model |

**Health response example:**
```json
{
  "status": "ok",
  "services": {
    "api": {"status": "ok"},
    "database": {"status": "ok", "pgvector": "0.8.7"},
    "ollama": {"status": "not_configured"}
  }
}
```
It returns **HTTP 503** with `"status": "degraded"` when the database is unreachable or pgvector is missing.

### 4.3 Frontend (PWA)

| Item | Detail |
|---|---|
| Routes | `/` Dashboard, `/upload`, `/documents`, `/chat`. Unknown paths redirect to `/`. |
| Dashboard | Calls `/api/health` and shows API, database and Ollama status pills, or an "API unreachable" message. |
| Upload / Documents / Chat | Placeholder pages that state which day each feature arrives. |
| Layout | Sidebar on desktop; bottom tab bar on screens 720px wide or less. Supports light and dark mode. |
| API base URL | `VITE_API_BASE_URL`, defaulting to `http://localhost:8000` |
| Manifest | Name "GAS Document Intelligence", standalone display, theme `#173F74` |
| Icons | 192 and 512 PNG, 512 maskable, 180 Apple touch icon, SVG favicon |
| Service worker | Workbox `generateSW` precaches only the static app shell (16 files). There is **no runtime caching**, so API responses, documents and answers are never cached. `/api/*` is excluded from the navigation fallback. |
| Ports | Dev and preview both use 5173, so they match the backend's CORS allow-list. |

## 5. Dependencies added

Each dependency was checked for licence cost and offline use.

| Package | Version | Licence | Purpose |
|---|---|---|---|
| fastapi | 0.162.0 | MIT | API framework |
| uvicorn[standard] | 0.54.0 | BSD-3 | ASGI server |
| pydantic / pydantic-settings | 2.14.1 / 2.16.1 | MIT | Validation and settings |
| psycopg[binary] | 3.3.6 | LGPL-3.0 (used unmodified as a library) | PostgreSQL driver |
| pytest *(dev)* | 9.1.1 | MIT | Tests |
| httpx *(dev)* | 0.28.1 | BSD-3 | FastAPI TestClient |
| react / react-dom | 19.3 | MIT | UI |
| react-router-dom | 7.18.4 | MIT | Routing |
| vite | 8.3.5 | MIT | Build tool |
| vite-plugin-pwa | 2.0.0 | MIT | Manifest and service worker |
| typescript, oxlint *(dev)* | 6.0 / 1.88 | Apache-2.0 / MIT | Type-checking and lint |

All are free, need no API keys, and work offline once installed.

## 6. Verification results

Every check below was actually run on 2026-10-25.

| Check | Command | Result |
|---|---|---|
| Backend unit tests | `cd backend && pytest` | ✅ 3 passed (health ok, health 503, CORS rejects foreign origin) |
| Backend integration test | `cd backend && pytest -m integration` | ✅ 1 passed against the live database |
| Live health endpoint | `GET http://127.0.0.1:8000/api/health` | ✅ HTTP 200, pgvector 0.8.7 |
| OpenAPI docs | `GET http://127.0.0.1:8000/docs` | ✅ HTTP 200 |
| CORS, allowed origin | Request with `Origin: http://localhost:5173` | ✅ `access-control-allow-origin` returned |
| CORS, foreign origin | Request with `Origin: https://evil.example` | ✅ No allow header |
| Frontend routing | `GET http://127.0.0.1:5173/chat` | ✅ HTTP 200 |
| Frontend lint | `npm run lint` | ✅ Clean |
| Frontend build | `npm run build` | ✅ Built; service worker precaches 16 entries (266 KiB) |
| Visual check | Headless Edge screenshots at 1100px and 600px | ✅ Dashboard shows live status; the phone layout fits with a bottom tab bar |
| Secrets hygiene | `git check-ignore .env` | ✅ `.env` is ignored; no secrets or dependency folders are untracked-but-addable |

## 7. Security controls in place

- PostgreSQL is bound to `127.0.0.1`, and the API is started on `127.0.0.1`. Nothing is exposed to the LAN or Internet.
- CORS uses an explicit origin list from `CORS_ORIGINS`, with no wildcard alongside credentials.
- Health errors report only the exception class, never connection strings or passwords.
- The service worker never caches API data or documents.
- `.env` is gitignored; `.env.example` holds placeholders only.
- No external AI or LLM calls exist anywhere in the code.

**Not yet in place:** authentication. Until it exists, the app must stay on localhost or a trusted LAN.

## 8. How to run (quick reference)

```powershell
# 1. Database
docker compose up -d

# 2. Backend (terminal 1)
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# 3. Frontend (terminal 2)
cd frontend
npm run dev          # open http://localhost:5173
```

First-time setup (venv creation, `pip install`, `npm install`) is in `README.md`.

## 9. Issues and notes

| Item | Impact | Action |
|---|---|---|
| Port 5432 already used by `pias-postgres` and a native PostgreSQL | None; GAS uses 5433 | Change `POSTGRES_PORT` in `.env` if needed |
| Other containers (`rpf-db-1`, `rpf-redis-1`, `rpf-objectstore-1`, `pias-postgres`) running | They take RAM on the 8 GB machine | Stop them during GAS work and demos |
| `fastapi.testclient` deprecation warning about `httpx` | None, cosmetic | Revisit when upgrading FastAPI |
| Headless Edge can't render narrower than about 500px | A testing quirk, not an app bug | The phone layout was verified at 600px instead |
| Code committed and pushed to GitHub (`main`, 18d4584) | Resolved | — |

## 10. Acceptance criteria progress (CLAUDE.md §13)

| Criterion | Status |
|---|---|
| Fresh local installation works from README without a paid AI API key | 🟡 Partial: works for the Day 1 scope |
| App works without Cloudflare on localhost/LAN | 🟡 Partial: the shell and health check work |
| No document or question is sent to external LLM/embedding APIs | ✅ True so far (no AI integration exists) |
| All other criteria (upload, extraction, pgvector embeddings, chat, citations, abstention, security tests) | ⬜ Days 2–7 |

## 11. Standing requirement: error handling and data protection

> **Note (added 2026-10-25):** Every module must include proper error handling and protect data **in transit** and **at rest**. This applies to all existing code and to **any addition or integration point added in future**. The full rule and the per-module checklist are in **CLAUDE.md §2A**, and each future completion report must include a compliance section.

**Day 1 measured against §2A:**

| Area | Day 1 state | Gap / follow-up |
|---|---|---|
| Input validation | Settings validated by Pydantic; there are no user inputs yet | Upload validation on Day 2 |
| Consistent error format | Health endpoint returns a structured 200/503 response | Add the standard `{"error": {...}}` format, global exception handlers and `request_id`. **Day 2, before the upload route.** |
| Timeouts | Database connection timeout of 3 s | Add a query timeout (`statement_timeout`) on Day 2; Ollama timeouts on Day 4 |
| No sensitive data leaks | Health reports only the error class, never credentials | Keep this as routes are added |
| Frontend error handling | Dashboard handles unreachable API and 503 | Apply the same pattern to every new screen |
| Failure-path tests | Database-down (503) and foreign-CORS tests exist | Add failure-path tests for every new module |
| Transit: localhost | HTTP on loopback only; DB and API bound to `127.0.0.1` | HTTPS is required before any LAN or remote access |
| Transit: security headers | Not yet | Add security-headers middleware on Day 2 |
| Rest: PDF storage | Not applicable yet (no uploads) | **App-level PDF encryption deferred by owner decision (2026-10-25).** Day 2 stores PDFs in the non-public `storage/` folder with restrictive permissions and serves them only through the API. Revisit before any confidential data or non-local deployment. |
| Rest: disk encryption | Not verified | Check whether BitLocker or Device Encryption is on for the drive holding the Docker volume and `storage/` (needs an admin shell: `manage-bde -status`) |
| Rest: secrets | `.env` gitignored with a random DB password | Keep all new secrets in `.env` only |
| Rest: browser | Service worker caches only the app shell | Keep this; never store documents, answers or tokens in the browser |

## 12. Next: Day 2

PDF upload and document storage:
1. Migration for the `documents` table (UUID, filename, internal storage path, SHA-256, type, status, error).
2. `POST /api/documents`: PDF-only checks (magic bytes, MIME type, maximum size, safe filename, no path traversal) and SHA-256 duplicate rejection. Files are stored in the non-public `storage/` folder.
3. Page-numbered text extraction with pypdf. Scanned pages are marked `ocr_required`.
4. `GET /api/documents` and `GET /api/documents/{id}`.
5. Upload screen (validation feedback, progress) and Documents list screen.
