# PHASES.md

## Phase 1: Backend Core & Database (FastAPI + Turso)
*   Set up FastAPI project and Turso connection via `sqlmodel`.
*   Create the `URLMapping` database schema (`id`, `short_code`, `long_url`, `clicks`, `created_at`, `expires_at`).
*   Implement the Base62 encoding/decoding utility (5-character output).
*   Create the `POST /api/urls/shorten` endpoint (Insert row, Base62 encode, Cache in Redis).
*   Create the `GET /{short_code}` fallback endpoint for Cache MISS scenarios (Includes Lazy Enforcement expiration check).

## Phase 2: Frontend & Edge Layer (Next.js + Upstash)
*   Initialize Next.js project.
*   Build the simple, responsive landing page UI with a single input field and submit button.
*   Implement Next.js Edge `middleware.ts` to intercept `/{short_code}` paths.
*   Add Upstash Redis checking to the middleware: Return HTTP 302 on Cache HIT, proxy to FastAPI on Cache MISS.
*   Implement the non-blocking `INCR` command in the middleware for analytics.

## Phase 3: Background Jobs & Analytics Sync (Vercel Cron)
*   Configure `vercel.json` with two cron schedules (30-minute flush, 24-hour purge).
*   Create the `POST /api/cron/flush-analytics` endpoint in FastAPI. Implement the atomic `redis.getset()` loop to update SQLite click counts.
*   Create the `POST /api/cron/purge-expired` endpoint in FastAPI to execute the bulk SQL `DELETE` and Redis key eviction.
*   Secure both cron endpoints with a Bearer token verification check.

## Phase 4: Final Polish & Deployment
*   Implement copy-to-clipboard functionality on the frontend UI.
*   Add loading states and error toast notifications (e.g., "Invalid URL").
*   Deploy backend to Azure App Service / FastAPI Cloud.
*   Deploy frontend to Vercel and map environment variables.
*   Conduct end-to-end testing on expiration and click increment accuracy.