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


import logging as _logging

_logger = _logging.getLogger(__name__)

STARTING_ID = 10000  # First short URL ID. Codes below this are reserved / not generated.
_SEED_ROW_ID = STARTING_ID - 1  # 9999 — dummy row used only to bump auto-increment counter


def init_db(target_engine=None) -> None:
    """Create all tables and seed the auto-increment counter.

    Turso/libSQL does NOT have a sqlite_sequence table and does NOT track
    deleted row IDs — it uses MAX(current_id) + 1 for every insert. The only
    reliable way to guarantee IDs start at STARTING_ID is to keep a permanent
    sentinel row at id = STARTING_ID - 1 (9999). That sentinel is never visible
    to application queries because real rows always have short_code NOT NULL.
    """
    from sqlmodel import text

    db_engine = target_engine or engine
    SQLModel.metadata.create_all(db_engine)

    try:
        with db_engine.begin() as conn:
            max_id = conn.execute(text("SELECT MAX(id) FROM url_mapping")).scalar()
            if max_id is None or max_id < _SEED_ROW_ID:
                conn.execute(
                    text(
                        "INSERT OR IGNORE INTO url_mapping "
                        "(id, short_code, long_url, clicks, created_at, expires_at) "
                        "VALUES (:id, NULL, '__id_offset_sentinel__', 0, "
                        "datetime('now'), datetime('now', '+36500 day'))"
                    ),
                    {"id": _SEED_ROW_ID},
                )
                _logger.info(
                    "ID-offset sentinel inserted at id=%d. "
                    "First real URL will receive id=%d.",
                    _SEED_ROW_ID, STARTING_ID,
                )
    except Exception as exc:
        _logger.warning("Could not insert ID-offset sentinel: %s", exc)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session.

    Usage:
        @app.get("/")
        def endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
