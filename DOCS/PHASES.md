# PHASES.md — Project Roadmap

## Phase 1: Backend Core & Database (FastAPI + Turso) — [STATUS: COMPLETED ✅]
* `[x]` Set up FastAPI project (`apps/url-shortener-api`) with Pydantic configuration (`core/config.py`).
* `[x]` Establish Turso connection via `sqlmodel` and `sqlalchemy-libsql` with Python 3.12 compatibility.
* `[x]` Create the `URLMapping` database schema (`id`, `short_code`, `long_url`, `clicks`, `created_at`, `expires_at`).
* `[x]` Implement the Base62 encoding/decoding utility (`core/base62.py`, 5-character output, 916M capacity).
* `[x]` Create `POST /api/urls/shorten` endpoint (Insert row, Base62 encode `id`, cache in Redis with 12h TTL).
* `[x]` Create `GET /{short_code}` fallback endpoint for cache miss scenarios (Lazy enforcement expiration check, re-cache in Redis, `INCR` analytics counter).
* `[x]` Create `GET /healthz` endpoint mounted before catch-all router.
* `[x]` Complete automated test suite (31/31 unit & integration tests passing via `uv run pytest tests/ -v`).

---

## Phase 2: Frontend & Edge Layer (Next.js + Upstash) — [STATUS: COMPLETED ✅]
* `[x]` Initialize Next.js project in `apps/url-shortener-web`.
* `[x]` Build clean, modern UI for inputting long URLs and displaying/copying generated short links.
* `[x]` Implement Next.js Edge Middleware (`proxy.ts`) to intercept `/{short_code}` requests.
* `[x]` Connect Edge Middleware to Upstash Redis:
  - **Cache HIT**: Return HTTP 302 Redirect directly from Edge (~15ms) + fire non-blocking `INCR analytics:clicks:{short_code}`.
  - **Cache MISS**: Proxy request to FastAPI backend (`GET /{short_code}`).

---

## Phase 3: Background Jobs & Analytics Sync (Vercel Cron) — [STATUS: COMPLETED ✅]
* `[x]` Configure `vercel.json` with two cron schedules (30-minute flush, 24-hour purge).
* `[x]` Create `POST /api/cron/flush-analytics` endpoint in FastAPI:

  - Iterate over `analytics:clicks:*` keys in Redis.
  - Execute atomic Lua script to retrieve and delete click delta safely.
  - Batch update Turso DB (`UPDATE url_mapping SET clicks = clicks + :val WHERE short_code = :short_code`).
* `[x]` Create `POST /api/cron/purge-expired` endpoint in FastAPI:
  - Bulk SQL query and delete expired records (`expires_at <= UTC_NOW`).
  - Evict corresponding Redis keys (`url:{short_code}`, `analytics:clicks:{short_code}`).
* `[x]` Create `GET /api/urls/{short_code}/stats` public endpoint to fetch total clicks (saved DB clicks + pending Redis delta).
* `[x]` Secure both cron endpoints with Bearer token authentication (`CRON_SECRET`) and Next.js Edge proxy routes.
* `[x]` Complete automated test suite (38/38 unit & integration tests passing).

---

## Phase 4: Final Polish & Deployment — [STATUS: PENDING ⏳]
* `[ ]` Implement copy-to-clipboard functionality on frontend UI with visual toast notifications.
* `[ ]` Add input validation and loading states on frontend.
* `[ ]` Deploy FastAPI backend (`apps/url-shortener-api`).
* `[ ]` Deploy Next.js frontend to Vercel (`apps/web`).
* `[ ]` Perform end-to-end verification (shorten, redirect, cache hit/miss, cron analytics flush, lazy expiration).