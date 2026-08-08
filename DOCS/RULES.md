# RULES.md

## 1. What to Use & Preferred Libraries
*   **Backend:** Use `fastapi`, `pydantic` for data validation, and `sqlmodel` (which wraps SQLAlchemy) for Turso database interactions.
*   **Redis Integration:** Use the official `upstash-redis` Python SDK for backend syncing, and `@upstash/redis` for the Next.js Edge Middleware.
*   **Environment Variables:** Strictly manage secrets (Turso Auth Token, Upstash Rest URL/Token, Cron Secret) via `.env` files.

## 2. Error Handling Guidelines
*   **Lazy Enforcement:** Do not rely solely on the 24-hour cron job for expiration. Always check `expires_at > NOW` during a database read.
*   **404 Not Found:** Return HTTP 404 cleanly if a short code does not exist or has expired.
*   **Graceful Degradation:** If Upstash Redis is down, Next.js Middleware must silently failover to proxying the request to the FastAPI backend to ensure links still work (though slower).

## 3. AI Boundaries / Constraints (What to Avoid)
*   **NO Synchronous DB Writes on Redirects:** Never write to Turso/SQLite during a `GET` redirect request. All analytics must flow through Redis `INCR` first.
*   **NO User Authentication:** The system is anonymous. Do not implement JWTs, login screens, or `uid` columns in the database.
*   **NO Heavy Backend Scheduling:** Avoid `APScheduler` or long-running background threads in Python. Rely entirely on Vercel Cron pinging protected FastAPI endpoints to handle background tasks.
*   **NO Caching of 301s:** Never use HTTP 301. Always use HTTP 302 to prevent browsers from permanently caching the redirect, which would bypass the analytics counter.