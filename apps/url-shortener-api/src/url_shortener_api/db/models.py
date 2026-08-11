"""SQLModel schema for the URLMapping table."""

from datetime import datetime, timedelta, timezone

from sqlmodel import Field, SQLModel

from url_shortener_api.core.config import settings

# ── Constants ───────────────────────────────────────────────────────
_LINK_TTL = timedelta(days=settings.LINK_TTL_DAYS)


def _utcnow() -> datetime:
    """Return the current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


def _default_expiry() -> datetime:
    """Return the default expiration time (now + 84 days)."""
    return _utcnow() + _LINK_TTL


class URLMapping(SQLModel, table=True):
    """Persistent storage for shortened URLs.

    Fields:
        id:         Auto-increment primary key. Used for Base62 encoding.
        short_code: Unique 5-character Base62 string derived from `id`.
        long_url:   The original URL to redirect to.
        clicks:     Total click count (updated via cron batch flush).
        created_at: Row creation timestamp (UTC).
        expires_at: Link expiration timestamp (UTC, defaults to +84 days).
    """

    __tablename__ = "url_mapping"
    __table_args__ = {"sqlite_autoincrement": True}

    id: int | None = Field(default=None, primary_key=True)
    short_code: str | None = Field(default=None, unique=True, index=True)
    long_url: str = Field(nullable=False)
    clicks: int = Field(default=0)
    created_at: datetime = Field(default_factory=_utcnow)
    expires_at: datetime = Field(default_factory=_default_expiry)

    def is_expired(self) -> bool:
        """Check if this link has expired (lazy enforcement).

        Handles both timezone-aware and naive datetimes (SQLite stores naive).
        """
        now = _utcnow()
        expires = self.expires_at
        # SQLite returns naive datetimes — treat them as UTC
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return now >= expires
