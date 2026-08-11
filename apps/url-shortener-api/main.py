"""URL Shortener API — FastAPI application entry point.

Lifespan events handle:
    - Database table creation (startup)
    - Redis client initialisation (startup)
    - Redis client cleanup (shutdown)
"""

import logging
from contextlib import asynccontextmanager

from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from url_shortener_api.api.routes import router, set_redis_client
from url_shortener_api.core.config import settings
from url_shortener_api.db.session import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown logic."""

    # ── Startup ─────────────────────────────────────────────────────
    # 1. Create database tables
    logger.info("Initialising database tables...")
    init_db()
    logger.info("Database tables ready.")

    # 2. Initialise Upstash Redis client (if credentials are configured)
    redis_client = None
    if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
        try:
            from upstash_redis import Redis

            redis_client = Redis(
                url=settings.UPSTASH_REDIS_REST_URL,
                token=settings.UPSTASH_REDIS_REST_TOKEN,
            )
            # Verify connectivity
            redis_client.ping()
            logger.info("Upstash Redis connected successfully.")
        except Exception as exc:
            logger.warning("Upstash Redis connection failed: %s — running without cache", exc)
            redis_client = None
    else:
        logger.info("Upstash Redis not configured — running without cache.")

    set_redis_client(redis_client)

    yield

    # ── Shutdown ────────────────────────────────────────────────────
    logger.info("Shutting down...")
    set_redis_client(None)


# ── App factory ─────────────────────────────────────────────────────
app = FastAPI(
    title="ShortyURL API",
    description="High-performance URL shortener backend",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────
# Allow Next.js frontend (and localhost for development)
_base = urlsplit(settings.BASE_URL)
_frontend_origin = f"{_base.scheme}://{_base.netloc}"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Next.js dev server (local)
        "http://127.0.0.1:3000",
        "https://linkcut-nine.vercel.app",
        _frontend_origin,
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Support Vercel preview deployments dynamically
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check (Must be registered BEFORE catch-all /{short_code} router) ─
@app.get("/healthz")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "shortyurl-api"}


# ── Mount API routes ────────────────────────────────────────────────
app.include_router(router)

