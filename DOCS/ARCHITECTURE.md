# ARCHITECTURE.md

## 1. App Flow & Architecture
The system is divided into two distinct operational paths to decouple high-speed reads from database writes.

**The Fast Path (URL Redirection / Consumption)**
*   **Routing:** Client -> Next.js Edge Middleware.
*   **Cache Check:** Middleware queries Upstash Redis (`GET url:{short_code}`).
*   **Cache HIT:** Middleware returns HTTP 302 Redirect instantly (~15ms). Middleware triggers a non-blocking `INCR analytics:clicks:{short_code}` to Upstash.
*   **Cache MISS:** Request proxies to FastAPI backend.

**The Slow Path (URL Creation & Cache Miss Recovery)**
*   **Creation:** Next.js UI -> `POST /api/urls/shorten` -> FastAPI.
*   **Storage:** FastAPI inserts the long URL into Turso (SQLite), gets the auto-increment `id`, converts it to a 5-character Base62 string, updates the SQLite row, caches it in Redis (84-day TTL), and returns the short code.
*   **Miss Recovery:** FastAPI queries SQLite. If `expires_at > NOW`, it caches the URL in Redis and returns HTTP 302. If expired, returns HTTP 404.

**The Background Path (Cron Jobs)**
*   **Analytics Sync (Every 30m):** Vercel Cron pings FastAPI. FastAPI runs an atomic `GETSET` on Redis click counters and increments the `clicks` column in SQLite.
*   **Expiration Purge (Every 24h):** Vercel Cron pings FastAPI. FastAPI executes a bulk `DELETE` in SQLite and Redis for all rows where `expires_at <= NOW`.

## 2. Tech Stack
*   **Frontend / Edge:** Next.js (App Router), deployed on Vercel.
*   **Backend:** FastAPI (Python), deployed on Azure App Service / FastAPI Cloud.
*   **Database:** Turso (SQLite) for persistent storage.
*   **Cache & Edge State:** Upstash (Serverless Redis).

## 3. Folder & File Structure
```text
/monorepo-root
├── /frontend               # Next.js Application
│   ├── /app
│   │   ├── layout.tsx
│   │   ├── page.tsx        # UI for inputting long URLs
│   │   └── /api            # Next.js API Routes (if needed for internal proxying)
│   ├── middleware.ts       # Edge Middleware for Redis checking & 302 Redirects
│   └── vercel.json         # Vercel Cron Job definitions
│
└── /backend                # FastAPI Application
    ├── main.py             # App entry point & lifespan events
    ├── /api
    │   ├── routes.py       # POST /shorten, GET /{short_code}
    │   └── cron.py         # POST /cron/flush-analytics, POST /cron/purge
    ├── /core
    │   ├── base62.py       # Integer to 5-char Base62 conversion logic
    │   └── config.py       # Env vars (Turso, Upstash, Cron Secrets)
    └── /db
        ├── models.py       # SQLModel schema (id, short_code, long_url, clicks, etc.)
        └── session.py      # Turso DB connection