# PRD.md (Product Requirements Document)

## 1. What to Build
A high-performance, login-less URL shortening web application (`ShortyURL`). The system converts long URLs into unique 5-character Base62 short codes. It is heavily optimized to deliver sub-20ms redirect latency using Next.js Edge Middleware and Upstash Redis caching, while maintaining accurate link analytics and staying strictly within free to low-tier hosting limits via asynchronous batch processing.

---

## 2. Targeted Users & Problem Statement
* **Target Users**: Anonymous internet users seeking a frictionless, immediate way to shorten long URLs without registering an account.
* **Core Value**: Zero-overhead link shortening with a guaranteed **84-day link lifespan**, high availability, and real-time click tracking.

---

## 3. Core Specifications & Features

### 3.1 URL Shortening
* **Format**: 5-character Base62 alphanumeric code (`0-9`, `A-Z`, `a-z`), supporting **916,132,832** unique short URLs.
* **Storage**: Primary persistence in Turso DB (`URLMapping` table).
* **Caching**: Cached in Upstash Redis (`url:{short_code}`) with a **12-hour Redis TTL** (`EX 43200`).

### 3.2 High-Speed Redirection
* **Fast Path (Edge Middleware)**: Intercepts `/{short_code}` in Next.js Edge Middleware, checks Upstash Redis, and returns an **HTTP 302 Redirect** directly from the Edge (~15ms response).
* **Slow Path (Backend Fallback)**: On cache miss, proxies request to FastAPI backend. Decodes Base62 `short_code` -> integer `id`, queries Turso DB by primary key `id`, checks lazy expiration (`expires_at > UTC_NOW`), re-populates Redis cache (12-hour TTL), and returns HTTP 302.

### 3.3 Link Analytics & Atomic Tracking
* Tracks total click counts per short code without write-amplification on the primary database.
* **Redis Key**: `analytics:clicks:{short_code}`.
* Increment via non-blocking `INCR` in Redis on every redirect.
* **Batch Sync**: Asynchronous Vercel Cron job flushes Redis click counts to Turso DB every 30 minutes using an atomic Lua script that reads and deletes each `analytics:clicks:{short_code}` counter in a single Redis operation.

### 3.4 Data Lifecycle & Expiration
* **Link Lifetime**: 84 days (`expires_at = UTC_NOW + 84 days`).
* **Lazy Enforcement**: Database reads verify `expires_at > UTC_NOW`. Expired links immediately return HTTP 404.
* **Purge Cron Job**: Daily Vercel Cron job physically deletes expired rows from Turso DB and evicts stale keys from Redis.