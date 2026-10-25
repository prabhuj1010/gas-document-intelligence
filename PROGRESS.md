# Progress

## Done

### Day 1 (2026-10-25): scaffold
- Set up the repo with `.gitignore`, `.env.example` and CLAUDE.md. Pushed to github.com/prabhuj1010/gas-document-intelligence (`main`, commit 18d4584).
- Docker Compose runs `pgvector/pgvector:pg16` on `127.0.0.1:5433`. The pgvector extension is created by `database/init/001_extensions.sql`.
- FastAPI has `GET /api/health`, which reports API, database and pgvector status (503 if the database is down) and whether Ollama is configured. CORS uses an allow-list, and OpenAPI docs are at `/docs`.
- The React + Vite + TS PWA has Dashboard (live health), Upload, Documents and Chat routes. It has a manifest, icons and a service worker that caches only the app shell. Navigation is a sidebar on desktop and a bottom tab bar on phones.
- Verified:
  - `pytest`: 3 passed.
  - `pytest -m integration`: 1 passed against the live database.
  - Live `/api/health`: 200, pgvector 0.8.7.
  - CORS allows `localhost:5173` and gives a foreign origin no allow header.
  - `npm run lint`: clean.
  - `npm run build`: OK, with the service worker precaching 16 entries.
  - Headless Edge screenshots of the Dashboard at desktop and phone widths show the live status.

## Blockers / notes
- Port 5432 is used by another container (`pias-postgres`) and by a native PostgreSQL, so GAS uses 5433.
- Other Docker containers (`rpf-*`, `pias-postgres`) use RAM on an 8 GB machine. Consider stopping them during GAS demos.
- `fastapi.testclient` gives a deprecation warning about `httpx`. It's harmless for now.

## Standing rule
- **CLAUDE.md §2A** applies to every module and every future integration point: error handling, data in transit and data at rest. Day 1 gaps are listed in `docs/day-1-completion.md` §11. Close the Day 2 items first: error format, exception handlers and security headers. App-level PDF encryption is deferred by owner decision (2026-10-25); revisit before any confidential data or non-local deployment.

## Next task
**Day 2:** add the PDF upload endpoint (signature, size and filename validation, SHA-256 duplicate check, storage in a non-public `storage/` folder), page-numbered text extraction with pypdf, the `documents` table migration, `GET /api/documents`, and the Upload and Documents screens.
