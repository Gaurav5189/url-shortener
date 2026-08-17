# LinkCut

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

A high-performance, login-less URL shortening service built for sub-20ms redirect latency using Edge Caching, Base62 encoding, and non-blocking asynchronous analytics.

---

## Features

- **Sub-20ms Edge Redirects**: Instant 302 redirects served directly from Edge middleware with Redis caching.
- **Zero PII & Anonymous**: No accounts, login, or personal tracking cookies required.
- **84-Day Link Lifespan**: Guaranteed 84-day retention with lazy expiration checks and scheduled purging.
- **Real-time Click Analytics**: Access public link analytics via `/{code}+` shortcut or dedicated search without database write-amplification.
- **Container Ready**: Fully containerized and ready to deploy with Docker / Podman.

---

## Architecture Overview

The system decouples high-speed read redirections from database writes across three operational paths:

![System Architecture Blueprint](assets/blueprint_v2.png)

- **Fast Path (Edge Middleware)**: Checks Redis (`url:{code}`) and returns an HTTP 302 redirect directly from the edge. Dispatches a non-blocking `INCR` to Redis for click tracking.
- **Slow Path (Backend Fallback)**: Decodes Base62 short code to integer ID for $O(1)$ indexed lookup in SQLite database. Re-populates Redis cache with a 12-hour TTL and triggers analytics increment.
- **Background Path (Cron Jobs)**: Flushes Redis click counters to SQLite database using an atomic Lua script that reads and deletes counters in a single Redis transaction.

---

## Tech Stack

* **Frontend / Edge:** Next.js (App Router) on Vercel Edge Middleware
* **Cache & Counter:** Redis (Serverless)
* **Backend Engine:** FastAPI
* **Database:** SQLite
* **Encoding:** 5-character Base62 short code generated from auto-incrementing integer IDs (~916 million capacity)

---

## Quick Start (Docker / Podman)

Get LinkCut running locally in seconds with pre-built container images:

```bash
# 1. Download the compose template
curl -O https://raw.githubusercontent.com/Gaurav5189/url-shortener/main/compose.yaml

# 2. Start the services
docker compose up -d
# or using Podman:
podman compose up -d
```

- **Web Application:** [http://localhost:3000](http://localhost:3000)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/healthz](http://localhost:8000/healthz)

---

> 📖 **Full Installation & Production Guide:**  
> For complete instructions on environment variables (`api.env`, `web.env`), production reverse proxy setup (Caddy/Nginx with SSL), local source development, and troubleshooting, refer to **[INSTALLATION.md](./INSTALLATION.md)**.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/urls/shorten` | Shorten a destination URL into a 5-character Base62 code |
| `GET` | `/{short_code}` | Redirects to original long URL (302 Found) |
| `GET` | `/{short_code}+` | Shortcut redirect to `/stats/{short_code}` analytics |
| `GET` | `/api/urls/{short_code}/stats` | Retrieve real-time click metrics and metadata |
| `POST` | `/api/cron/flush-analytics` | Protected endpoint to flush Redis click counters to DB |
| `POST` | `/api/cron/purge-expired` | Protected endpoint to purge expired links (84-day lifespan) |
| `GET` | `/healthz` | API service health check |

---

## Documentation

Detailed architecture specifications, rules, and guides:
- [INSTALLATION.md](./INSTALLATION.md) — Complete Installation, Production Proxy & Deployment Guide
- [DOCS/README.md](./DOCS/README.md) — Documentation & Legal Overview
- [DOCS/PRD.md](./DOCS/PRD.md) — Product Requirements & Specifications
- [DOCS/ARCHITECTURE.md](./DOCS/ARCHITECTURE.md) — Detailed System Flows & Blueprint
- [DOCS/RULES.md](./DOCS/RULES.md) — Development & Architectural Constraints
- [DOCS/DESIGN.md](./DOCS/DESIGN.md) — Design Tokens & UI Specifications

---

## License

Distributed under the [Apache 2.0 License](./LICENSE).
