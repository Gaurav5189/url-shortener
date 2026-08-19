"""Core configuration — loads environment variables via Pydantic Settings."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env_file() -> Path | None:
    """Walk up from this file to find the nearest .env file."""
    current = Path(__file__).resolve().parent
    for _ in range(6):  # Walk up at most 6 levels
        env_path = current / ".env"
        if env_path.is_file():
            return env_path
        current = current.parent
    return None


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=_find_env_file(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Turso / LibSQL ──────────────────────────────────────────────
    TURSO_DATABASE_URL: str
    TURSO_AUTH_TOKEN: str = ""

    # ── Upstash Redis (REST API) ────────────────────────────────────
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # ── Application ─────────────────────────────────────────────────
    BASE_URL: str = "http://localhost:8000"
    CRON_SECRET: str

    # ── Constants ───────────────────────────────────────────────────
    LINK_TTL_DAYS: int = 84
    REDIS_CACHE_TTL_SECONDS: int = 43_200  # Default set to 12 hours, change this in production environment
    RATE_LIMIT_PER_MINUTE: int = 5      # Default set to 5, change this in production environment
    RATE_LIMIT_PER_5HR: int = 100        # Default set to 100, change this in production environment
    TRUST_PROXY: bool = False          # Set to True on Azure/Vercel(backend) to trust X-Forwarded-For


settings = Settings()
