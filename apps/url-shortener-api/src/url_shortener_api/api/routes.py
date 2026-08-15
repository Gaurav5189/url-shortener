"""API routes for URL shortening and redirection.

Endpoints:
    POST /api/urls/shorten  — Create a new short URL
    GET  /{short_code}      — Redirect to the original URL (cache-miss fallback)
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl
from sqlmodel import Session, select

from url_shortener_api.core import base62
from url_shortener_api.core.config import settings
from url_shortener_api.core.sync import purge_expired_urls, sync_analytics_to_db
from url_shortener_api.db.models import URLMapping
from url_shortener_api.db.session import get_session



logger = logging.getLogger(__name__)

router = APIRouter()

# ── Redis client (set during app lifespan) ──────────────────────────
# This is injected from main.py's lifespan to avoid import-time side effects.
_redis = None


def set_redis_client(client) -> None:
    """Set the module-level Redis client. Called from main.py lifespan."""
    global _redis
    _redis = client


# ── Request / Response schemas ──────────────────────────────────────


class ShortenRequest(BaseModel):
    """Request body for the POST /api/urls/shorten endpoint."""

    url: HttpUrl  # Pydantic validates it's a proper HTTP/HTTPS URL


class ShortenResponse(BaseModel):
    """Response body for the POST /api/urls/shorten endpoint."""

    short_code: str
    short_url: str


# ── POST /api/urls/shorten ──────────────────────────────────────────


@router.post("/api/urls/shorten", response_model=ShortenResponse)
def shorten_url(
    body: ShortenRequest,
    session: Session = Depends(get_session),
) -> ShortenResponse:
    """Create a new shortened URL.

    Flow:
        1. Insert a new URLMapping row (without short_code).
        2. Commit to get the auto-increment `id`.
        3. Base62-encode `id` → `short_code`.
        4. Update the row with the short_code.
        5. Cache `url:{short_code} → long_url` in Redis (12h TTL).
        6. Return the short_code and full short URL.
    """
    long_url = str(body.url)

    # Step 1-2: Insert row and get auto-increment id
    mapping = URLMapping(long_url=long_url)
    session.add(mapping)
    session.flush()

    # Step 3-4: Generate short_code from id and update row
    short_code = base62.encode(mapping.id)
    mapping.short_code = short_code
    session.commit()

    # Step 5: Cache in Redis (non-blocking, fire-and-forget)
    if _redis is not None:
        try:
            ttl = settings.REDIS_CACHE_TTL_SECONDS
            if mapping.expires_at is not None:
                expires = mapping.expires_at
                if expires.tzinfo is None:
                    expires = expires.replace(tzinfo=timezone.utc)
                remaining = int((expires - datetime.now(timezone.utc)).total_seconds())
                if remaining <= 0:
                    # Already expired — skip caching entirely
                    logger.debug("Skipping cache: url:%s has already expired", short_code)
                else:
                    ttl = min(ttl, remaining)
                    _redis.set(
                        f"url:{short_code}",
                        long_url,
                        ex=ttl,
                    )
            else:
                _redis.set(
                    f"url:{short_code}",
                    long_url,
                    ex=ttl,
                )
        except Exception:
            logger.warning("Redis SET failed for url:%s — skipping cache", short_code)

    # Step 6: Return response
    short_url = f"{settings.BASE_URL.rstrip('/')}/{short_code}"
    return ShortenResponse(short_code=short_code, short_url=short_url)


# ── POST /api/cron/flush-analytics ──────────────────────────────────


def verify_cron_secret(authorization: str = Header(None)):
    expected_header = f"Bearer {settings.CRON_SECRET}"
    if authorization != expected_header:
        raise HTTPException(status_code=401, detail="Unauthorized cron invocation")


@router.post("/api/cron/flush-analytics")
def trigger_analytics_sync(
    dependencies=Depends(verify_cron_secret),
    session: Session = Depends(get_session)
):
    """Triggered by Vercel Cron (30m) to flush Redis clicks to SQLite."""

    try:
        return sync_analytics_to_db(_redis, session)
    except Exception as e:
        logger.error("Analytics sync failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Sync failed")


# ── POST /api/cron/purge-expired ────────────────────────────────────


@router.post("/api/cron/purge-expired")
def trigger_purge_expired(
    dependencies=Depends(verify_cron_secret),
    session: Session = Depends(get_session)
):
    """Triggered by Vercel Cron (24h) to delete expired links and evict Redis cache."""
    try:
        return purge_expired_urls(_redis, session)
    except Exception as e:
        logger.error("Purge expired URLs failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Purge failed")



# ── GET /api/urls/{short_code}/stats ────────────────────────────────


@router.get("/api/urls/{short_code}/stats")
def get_url_stats(short_code: str, session: Session = Depends(get_session)):
    """Fetch URL statistics, combining saved clicks + pending Redis clicks."""
    statement = select(URLMapping).where(URLMapping.short_code == short_code)
    mapping = session.exec(statement).first()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Short code not found")
        
    pending_clicks_int = 0
    if _redis is not None:
        try:
            pending_clicks = _redis.get(f"analytics:clicks:{short_code}")
            pending_clicks_int = int(pending_clicks) if pending_clicks else 0
        except Exception as e:
            logger.warning("Failed to fetch pending clicks from redis: %s", str(e))
    
    created_at = mapping.created_at
    if created_at and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    expires_at = mapping.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return {
        "short_code": mapping.short_code,
        "original_url": mapping.long_url,
        "total_clicks": mapping.clicks + pending_clicks_int,
        "created_at": created_at.isoformat() if created_at else None,
        "expires_at": expires_at.isoformat() if expires_at else None,
    }



# ── GET /{short_code} ──────────────────────────────────────────────

@router.get("/{short_code}")
def redirect_short_url(
    short_code: str,
    session: Session = Depends(get_session),
) -> RedirectResponse:
    """Redirect to the original URL (cache-miss fallback path).

    This endpoint is hit when the Next.js Edge middleware has a cache MISS
    and proxies the request to the FastAPI backend.

    Flow:
        1. Base62-decode `short_code` → integer `id`.
        2. Query Turso by primary key `id`.
        3. If not found → 404.
        4. Lazy enforcement: if expired → 404.
        5. Re-cache in Redis (12h TTL).
        6. Increment analytics counter in Redis (non-blocking).
        7. Return HTTP 302 redirect.

    Per RULES.md: NO synchronous DB writes on redirects.
    """
    # Step 1: Decode short_code to DB id
    try:
        record_id = base62.decode(short_code)
    except ValueError:
        raise HTTPException(status_code=404, detail="Invalid short code")

    # Step 2: Query by primary key (fast indexed lookup)
    mapping = session.get(URLMapping, record_id)

    # Step 3: Not found
    if mapping is None or mapping.short_code != short_code:
        raise HTTPException(status_code=404, detail="Short URL not found")

    # Step 4: Lazy enforcement — check expiration
    if mapping.is_expired():
        raise HTTPException(status_code=404, detail="Short URL has expired")

    # Step 5: Re-cache in Redis
    if _redis is not None:
        try:
            ttl = settings.REDIS_CACHE_TTL_SECONDS
            if mapping.expires_at is not None:
                expires = mapping.expires_at
                if expires.tzinfo is None:
                    expires = expires.replace(tzinfo=timezone.utc)
                remaining = int((expires - datetime.now(timezone.utc)).total_seconds())
                if remaining <= 0:
                    logger.debug("Skipping re-cache: url:%s has already expired", short_code)
                else:
                    ttl = min(ttl, remaining)
                    _redis.set(
                        f"url:{short_code}",
                        mapping.long_url,
                        ex=ttl,
                    )
            else:
                _redis.set(
                    f"url:{short_code}",
                    mapping.long_url,
                    ex=ttl,
                )
        except Exception:
            logger.warning(
                "Redis SET failed for url:%s — skipping cache", short_code
            )

    # Step 6: Increment analytics counter in Redis (non-blocking)
    if _redis is not None:
        try:
            _redis.incr(f"analytics:clicks:{short_code}")
        except Exception:
            logger.warning(
                "Redis INCR failed for analytics:clicks:%s", short_code
            )

    # Step 7: HTTP 302 redirect (NEVER 301 — per RULES.md)
    return RedirectResponse(url=mapping.long_url, status_code=302)
