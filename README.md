# LinkCut

> **UNDER ACTIVE DEVELOPMENT**

A high-performance, login-less URL shortening service built for sub-20ms redirect latency using Edge Caching, Base62 encoding, and non-blocking asynchronous analytics.

---

## Project Status & Roadmap

- `[x]` **Phase 1: Backend Core & Database (FastAPI + Turso)**
  - Base62 5-character encoding ($62^5 = 916\text{M}$ unique codes)
  - Turso DB persistence (`URLMapping` schema)
  - Upstash Redis caching (12-hour TTL)
  - `POST /api/urls/shorten`, `GET /{short_code}`, `GET /healthz`
  - Automated test suite (**31/31 passing**)
- `[x]` **Phase 2: Next.js Frontend & Edge Middleware**
  - Next.js 14 App Router landing page
  - Edge Middleware for instant 302 redirects from Redis (~15ms)
- `[x]` **Phase 3: Background Jobs & Analytics Sync**
  - Vercel Cron 30-minute analytics flush (atomic Lua retrieve-and-delete from Redis → Turso DB)
  - 24-hour lazy & bulk expiration purge (84-day link lifespan)
- `[x]` **Phase 4: Polish & Production Deployment**

---

## Architecture Overview

The system decouples read redirections from database writes across three operational paths:

![System Architecture Blueprint](assets/blueprint_v2.png)

- **Fast Path (Edge Middleware)**: Checks Upstash Redis (`url:{code}`) and returns an HTTP 302 redirect directly from the edge. Sends a non-blocking `INCR` to Redis for click tracking.
- **Slow Path (Backend Fallback)**: Decodes Base62 short code to primary key ID for $O(1)$ indexed lookup in Turso DB. Populates Redis cache with a 12-hour TTL.
- **Background Path (Cron Jobs)**: Atomically flushes Redis click counters to Turso DB every 30 minutes via a Lua script that reads and deletes each counter in a single atomic Redis operation.

---

## Tech Stack

- **Backend**: FastAPI, SQLModel, Pydantic, Python 3.12 (`apps/url-shortener-api`)
- **Database**: Turso (libSQL / SQLite) via `sqlalchemy-libsql`
- **Cache & Analytics**: Upstash Redis (REST API)
- **Frontend / Edge**: Next.js 14 App Router, Vercel Edge Middleware (`apps/web`)

---

## Quick Start (Backend)

### 1. Prerequisites
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- Python 3.12 (managed automatically via `.python-version`)

### 2. Environment Setup
Create `apps/url-shortener-api/.env` based on `.env.example`:

```ini
TURSO_DATABASE_URL=sqlite+libsql://<your-turso-db>.turso.io/?secure=true
TURSO_AUTH_TOKEN=<your-turso-token>
UPSTASH_REDIS_REST_URL=https://<your-redis-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
cd apps/url-shortener-api
uv run fastapi dev main.py
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/healthz`

### 4. Run Test Suite
```bash
cd apps/url-shortener-api
uv run pytest tests/ -v
```

---

## Documentation

Detailed architecture specifications and rules can be found in [/DOCS](./DOCS):
- [PRD.md](./DOCS/PRD.md) — Product Requirements & Specifications
- [ARCHITECTURE.md](./DOCS/ARCHITECTURE.md) — Detailed System Flows & Schemas
- [PHASES.md](./DOCS/PHASES.md) — Implementation Roadmap & Status
- [RULES.md](./DOCS/RULES.md) — Development Constraints & Safety Rules
