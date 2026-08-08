# RULES.md — Development Constraints & Architecture Rules

## 1. Stack & Runtime Requirements
* **Backend Runtime**: Must use **Python 3.12** for `apps/url-shortener-api`. The system default Python 3.14 causes a `SIGSEGV` in the `libsql-experimental` C-extension. The `.python-version` file in `apps/url-shortener-api` must remain intact.
* **Database Connection**: Turso DB connection string must use `sqlite+libsql://<host>/?secure=true` (with trailing slash before `?secure=true`) via `sqlalchemy-libsql==0.2.0`.
* **Redis Integration**: Use the official `upstash-redis` Python REST SDK for backend, and `@upstash/redis` for Next.js Edge Middleware.
* **Environment Variables**: Strictly manage secrets (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`) via `.env` files.

---

## 2. Route Registration & Error Handling
* **Route Mounting**: Utility endpoints (like `@app.get("/healthz")`) **must be mounted BEFORE** `app.include_router(router)` in `main.py` to prevent the catch-all `GET /{short_code}` endpoint from intercepting them.
* **Lazy Enforcement**: Do not rely solely on the 24-hour purge cron job. Always verify `expires_at > UTC_NOW` during a database read.
* **404 Not Found**: Return HTTP 404 cleanly with structured JSON detail if a short code does not exist, is invalid, or has expired.
* **Graceful Degradation**: If Upstash Redis is unconfigured or down, the application must log a warning and silently failover to direct database operations without throwing 500 errors.

---

## 3. Strict Architectural Constraints
* **NO Synchronous DB Writes on Redirects**: Never write to Turso/SQLite during a `GET /{short_code}` redirect request. All click analytics must flow through Redis `INCR` first.
* **NO HTTP 301 Permanent Redirects**: Always use **HTTP 302 Found** for redirects. 301 redirects are cached permanently by browsers, which bypasses analytics tracking on subsequent clicks.
* **NO User Authentication**: The application is anonymous and login-less. Do not implement JWT user auth or user tables.
* **NO Heavy Backend Schedulers**: Do not use `APScheduler` or background python threads. Rely entirely on Vercel Cron pinging protected FastAPI endpoints (`/api/cron/*`).