"""Turso / LibSQL database engine and session management.

Uses sqlalchemy-libsql (v0.2.0) which relies on the native Rust
libsql-experimental driver.
"""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from url_shortener_api.core.config import settings
from url_shortener_api.db import models  # noqa: F401

# ── Engine construction ─────────────────────────────────────────────
# sqlalchemy-libsql dialect format:
#   Remote:   sqlite+libsql://<host>/?secure=true
#   Local:    sqlite+libsql:///path/to/file.db
#
# The user's TURSO_DATABASE_URL may arrive as:
#   "libsql://shortyurl-mistic.aws-us-east-1.turso.io"
# We need to transform it to:
#   "sqlite+libsql://shortyurl-mistic.aws-us-east-1.turso.io/?secure=true"

_raw_url = settings.TURSO_DATABASE_URL

if _raw_url.startswith("sqlite+libsql://"):
    _db_url = _raw_url
elif _raw_url.startswith("libsql://"):
    host = _raw_url.removeprefix("libsql://").rstrip("/")
    _db_url = f"sqlite+libsql://{host}/?secure=true"
else:
    _db_url = f"sqlite+libsql:///{_raw_url}"

_connect_args: dict = {}
if settings.TURSO_AUTH_TOKEN:
    _connect_args["auth_token"] = settings.TURSO_AUTH_TOKEN

engine = create_engine(
    _db_url,
    connect_args=_connect_args,
    echo=False,
)


def init_db() -> None:
    """Create all tables defined by SQLModel metadata.

    Called once during application startup (lifespan).
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session.

    Usage:
        @app.get("/")
        def endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
