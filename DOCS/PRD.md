# PRD.md (Project Requirements Document)

## 1. What to Build
A high-performance, login-less URL shortening web application. The system converts long URLs into unique 5-character Base62 short codes. It is heavily optimized to deliver sub-20ms redirect latency using Edge caching, while maintaining accurate link analytics and staying strictly within free-tier hosting limits via asynchronous batch processing.

## 2. Targeted User
* Anonymous internet users seeking a frictionless, immediate way to shorten long URLs.
* Users who need temporary links (guaranteed 84-day lifespan) without the burden of creating an account or managing a dashboard.

## 3. Core Features
* **URL Shortening:** Generates a unique 5-character Base62 short code for every submitted long URL, ensuring isolated analytics even for identical target URLs.
* **Ultra-Fast Redirection:** Next.js Edge Middleware intercepts requests, queries Upstash Redis, and issues HTTP 302 redirects directly to the user to minimize latency.
* **Universal Link Analytics:** Tracks total click counts per short code. Uses non-blocking atomic increments in Redis, which are batched and flushed to the primary database every 30 minutes to prevent write-amplification.
* **Automated Data Lifecycle:** Enforces a strict 84-day expiration on all links. Expired links are rejected at the application level (lazy enforcement) and physically purged from the database via a daily background cron job to manage storage capacity.
* **Sleek Interface:** A responsive, fast Next.js frontend focused purely on inputting a link and copying the resulting short code.