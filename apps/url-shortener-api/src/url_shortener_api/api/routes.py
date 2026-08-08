"""API routes for URL shortening and redirection.

Endpoints:
    POST /api/urls/shorten  — Create a new short URL
    GET  /{short_code}      — Redirect to the original URL (cache-miss fallback)
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl
from sqlmodel import Session

from url_shortener_api.core import base62
from url_shortener_api.core.config import settings
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
async def shorten_url(
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
    session.commit()
    session.refresh(mapping)

    # Step 3-4: Generate short_code from id and update row
    short_code = base62.encode(mapping.id)
    mapping.short_code = short_code
    session.add(mapping)
    session.commit()

    # Step 5: Cache in Redis (non-blocking, fire-and-forget)
    if _redis is not None:
        try:
            _redis.set(
                f"url:{short_code}",
                long_url,
                ex=settings.REDIS_CACHE_TTL_SECONDS,
            )
        except Exception:
            logger.warning("Redis SET failed for url:%s — skipping cache", short_code)

    # Step 6: Return response
    short_url = f"{settings.BASE_URL.rstrip('/')}/{short_code}"
    return ShortenResponse(short_code=short_code, short_url=short_url)


# ── GET /{short_code} ──────────────────────────────────────────────


@router.get("/{short_code}")
async def redirect_short_url(
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
            _redis.set(
                f"url:{short_code}",
                mapping.long_url,
                ex=settings.REDIS_CACHE_TTL_SECONDS,
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
