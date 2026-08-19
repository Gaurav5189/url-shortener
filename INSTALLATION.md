# LinkCut Installation & Deployment Guide

This guide covers all deployment and setup methods for LinkCut, from containerized production setups with reverse proxies to running directly on localhost from source.

---

## Container Images

Pre-built multi-architecture container images are available on Docker Hub:
- **API Backend:** `docker.io/gaurav0s/url-shortener-api:latest`
- **Web Frontend:** `docker.io/gaurav0s/url-shortener-web:latest`

---

## Method 1: Docker Compose / Podman Compose (Recommended for local & testing)

### 1. Setup Environment Files

Create `api.env` in your deployment directory:

```ini
# Database: Local SQLite volume path (4 slashes required for absolute path)
TURSO_DATABASE_URL=sqlite+libsql:////app/data/urls.db
TURSO_AUTH_TOKEN=

# Base URL for generated short link redirects
BASE_URL=http://localhost:8000
# Required: Set this to a unique high-entropy secret.
CRON_SECRET=<unique-random-secret>

# Optional: Upstash Redis credentials for caching (optional, if not provided, Redis caching will be disabled)
UPSTASH_REDIS_REST_URL=https://<your-redis-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
```

Create `web.env` in your deployment directory:

```ini
# Internal server-to-server URL (Next.js server -> FastAPI container over virtual bridge network)
API_URL=http://api:8000

# Public site domain for generating shareable short link URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Client-side API URL (leave empty "" for relative /api routing behind reverse proxies, or set full URL)
NEXT_PUBLIC_API_URL=""

# Optional: Upstash Redis credentials for Edge redirects (optional)
UPSTASH_REDIS_REST_URL=https://<your-redis-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
```

---

### 2. Create `compose.yaml`

```yaml
services:
  api:
    image: docker.io/gaurav0s/url-shortener-api:latest
    container_name: linkcut-api
    ports:
      - "8000:8000"
    env_file:
      - ./api.env
    volumes:
      - linkcut_data:/app/data:Z
    restart: unless-stopped

  web:
    image: docker.io/gaurav0s/url-shortener-web:latest
    container_name: linkcut-web
    ports:
      - "3000:3000"
    env_file:
      - ./web.env
    depends_on:
      - api
    restart: unless-stopped

volumes:
  linkcut_data:
```

> **Note on `:Z` flag:** The `:Z` flag on the volume mount configures SELinux and user namespace permissions automatically for rootless Podman and Docker.

---

### 3. Launch Services

```bash
# Using Docker:
docker compose up -d

# Using Podman:
podman compose up -d
# or:
podman-compose up -d
```

---

### 4. Verify Services

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/healthz](http://localhost:8000/healthz)

```bash
curl http://localhost:8000/healthz
# Returns: {"status":"ok","service":"shortyurl-api"}
```

---

## Method 2: Production Setup (Single Domain with Nginx or Caddy / SSL)

When deploying on a cloud VM (e.g. Azure, AWS, Hetzner, DigitalOcean) behind a single custom domain with automatic HTTPS.

### 1. Update Environment Files for Production

In `api.env`:
```ini
BASE_URL=https://your-domain.com
```

In `web.env`:
```ini
API_URL=http://api:8000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=""
```
> NOTE: Setting `API_URL=http://api:8000` allows Next.js server-side code to talk directly to FastAPI container-to-container over Podman's internal virtual network with zero latency.

### 2. Bind Ports Locally in `compose.yaml`

Prevent containers from directly exposing unencrypted HTTP traffic to the public internet by binding to `127.0.0.1`:

```yaml
services:
  api:
    image: docker.io/gaurav0s/url-shortener-api:latest
    container_name: linkcut-api
    ports:
      - "127.0.0.1:8000:8000"
    env_file:
      - ./api.env
    volumes:
      - linkcut_data:/app/data:Z
    restart: unless-stopped

  web:
    image: docker.io/gaurav0s/url-shortener-web:latest
    container_name: linkcut-web
    ports:
      - "127.0.0.1:3000:3000"
    env_file:
      - ./web.env
    depends_on:
      - api
    restart: unless-stopped

volumes:
  linkcut_data:
```

---

## Method 3: Standalone Docker / Podman CLI

If running containers individually without compose:

```bash
# 1. Create a dedicated bridge network and persistent volume
docker network create linkcut-net
docker volume create linkcut-data

# 2. Pull container images
docker pull docker.io/gaurav0s/url-shortener-api:latest
docker pull docker.io/gaurav0s/url-shortener-web:latest

# 3. Run API backend container
docker run -d \
  --name linkcut-api \
  --network linkcut-net \
  -p 8000:8000 \
  --env-file ./api.env \
  -v linkcut-data:/app/data:Z \
  docker.io/gaurav0s/url-shortener-api:latest

# 4. Run Web frontend container
docker run -d \
  --name linkcut-web \
  --network linkcut-net \
  -p 3000:3000 \
  --env-file ./web.env \
  docker.io/gaurav0s/url-shortener-web:latest
```

---

## Troubleshooting & FAQ

### 1. Podman: `lchown /etc/gshadow: invalid argument`
**Cause:** Rootless Podman user does not have subordinate UID/GID mappings configured.  
**Fix:** Run on the host system:
```bash
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER
podman system migrate
```

### 2. SQLite Error 14: `SQLITE_CANTOPEN`
**Cause:** Using 3 slashes instead of 4 in URI (`sqlite+libsql:///app/data/urls.db` resolves relative to container working dir `/app/app/data/...`).  
**Fix:** Use 4 slashes in `api.env`:
```ini
TURSO_DATABASE_URL=sqlite+libsql:////app/data/urls.db
```

### 3. `API_URL` vs `NEXT_PUBLIC_API_URL`
- **`API_URL=http://api:8000`**: Used **server-side** by Next.js inside the container to reach the API container directly over the internal network without public internet latency.
- **`NEXT_PUBLIC_API_URL=""`**: Used **client-side** by the browser. Leaving it empty causes the browser to make relative requests (`/api/urls/shorten`) through your reverse proxy automatically without hardcoded hostnames or CORS issues.

---

## Method 4: Localhost Setup (Running from Source)

For developers wanting to run both the FastAPI backend and Next.js frontend directly on their local machine without containers.

### 1. Prerequisites
- **Python:** 3.12+ and [uv](https://github.com/astral-sh/uv) (fast Python package installer)
- **Node.js:** 20+ and [pnpm](https://pnpm.io)

---

### 2. Backend Setup (`apps/url-shortener-api`)

1. Navigate to the backend directory and copy the environment template:
   ```bash
   cd apps/url-shortener-api
   cp .env.example .env
   ```

2. Configure `.env` for local execution:
   ```ini
   TURSO_DATABASE_URL=sqlite+libsql:///data/urls.db
   TURSO_AUTH_TOKEN=
   BASE_URL=http://localhost:8000
   CRON_SECRET=local_dev_secret
   ```

3. Create virtual environment and install dependencies:
   ```bash
   # Automatic virtualenv creation and package sync with uv:
   uv sync

   # Or using traditional venv + uv pip:
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uv run fastapi dev
   ```
   - **API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check:** [http://localhost:8000/healthz](http://localhost:8000/healthz)

5. Run test suite:
   ```bash
   uv run pytest tests/ -v
   ```

---

### 3. Frontend Setup (`apps/url-shortener-web`)

1. Open a new terminal, navigate to the web directory, and copy the environment template:
   ```bash
   cd apps/url-shortener-web
   cp .env.example .env
   ```

2. Configure `.env` for local execution:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   API_URL=http://localhost:8000
   ```

3. Install dependencies and start the development server:
   ```bash
   pnpm install
   pnpm dev
   ```
   - **Web Application:** [http://localhost:3000](http://localhost:3000)

> BONUS: I have already setup api_start.sh and web_start.sh to run the applications from root directory(pkg installation still manual needed first time). 

```bash
./api_start.sh
./web_start.sh
```