"""Integration tests for API routes.

Uses an in-memory SQLite database and a mocked Redis client
to test the POST /api/urls/shorten and GET /{short_code} endpoints.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

from url_shortener_api.api import routes as routes_module
from url_shortener_api.core.config import settings
from url_shortener_api.db import session as session_module
from url_shortener_api.db.models import URLMapping


# ── Test fixtures ───────────────────────────────────────────────────

# In-memory SQLite engine for testing.
# StaticPool + check_same_thread=False avoids thread-safety issues
# when FastAPI's TestClient runs handlers in a threadpool.
_test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables and initialize sequence before each test, drop after."""
    session_module.init_db(_test_engine)
    yield
    SQLModel.metadata.drop_all(_test_engine)


def _get_test_session():
    """Override for FastAPI's get_session dependency."""
    with Session(_test_engine) as s:
        yield s


@pytest.fixture()
def session():
    """Provide a test database session."""
    with Session(_test_engine) as s:
        yield s


@pytest.fixture()
def mock_redis():
    """Provide a mocked Redis client and inject it into routes."""
    redis = MagicMock()
    redis.get.return_value = None
    redis.eval.return_value = "0"
    routes_module.set_redis_client(redis)
    yield redis
    routes_module.set_redis_client(None)


@pytest.fixture()
def client(mock_redis):
    """Provide a FastAPI TestClient with overridden dependencies."""
    # pyrefly: ignore [missing-import]
    from main import app

    app.dependency_overrides[session_module.get_session] = _get_test_session
    yield TestClient(app)
    app.dependency_overrides.clear()


# ── Health check test ───────────────────────────────────────────────


def test_healthz_endpoint(client: TestClient):
    """GET /healthz should return 200 OK and status JSON."""
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "shortyurl-api"}


# ── POST /api/urls/shorten tests ────────────────────────────────────


class TestShortenEndpoint:
    """Tests for POST /api/urls/shorten."""

    def test_shorten_valid_url(self, client: TestClient):
        """Valid URL should return a short code."""
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com/very/long/path"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "short_code" in data
        assert "short_url" in data
        assert len(data["short_code"]) == 5

    def test_shorten_stores_in_db(self, client: TestClient, session: Session):
        """Shortened URL should be persisted in the database."""
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
        )
        data = resp.json()

        # Query the DB directly (skip sentinel row which has short_code=None)
        mapping = session.exec(select(URLMapping).where(URLMapping.short_code != None)).first()  # noqa: E711
        assert mapping is not None
        assert mapping.id == 10000
        assert mapping.short_code == data["short_code"]
        assert "example.com" in mapping.long_url
        assert mapping.clicks == 0

    def test_shorten_caches_in_redis(self, client: TestClient, mock_redis: MagicMock):
        """Shortened URL should be cached in Redis."""
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
        )
        data = resp.json()

        mock_redis.set.assert_called_once()
        call_args = mock_redis.set.call_args
        assert call_args[0][0] == f"url:{data['short_code']}"
        assert call_args[1]["ex"] == 43200  # 12 hours

    def test_shorten_invalid_url(self, client: TestClient):
        """Invalid URL should return 422."""
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "not-a-valid-url"},
        )
        assert resp.status_code == 422

    def test_shorten_missing_url(self, client: TestClient):
        """Missing URL field should return 422."""
        resp = client.post("/api/urls/shorten", json={})
        assert resp.status_code == 422

    def test_shorten_sets_expiration(self, client: TestClient, session: Session):
        """Created mapping should have expires_at ~84 days from now."""
        client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
        )

        # Skip sentinel row (short_code=None)
        mapping = session.exec(select(URLMapping).where(URLMapping.short_code != None)).first()  # noqa: E711
        assert mapping is not None

        # Check expires_at is approximately 84 days from now (±1 day tolerance)
        now = datetime.now(timezone.utc)
        expected = now + timedelta(days=84)
        expires = mapping.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        delta = abs((expires - expected).total_seconds())
        assert delta < 86400, f"Expiration delta too large: {delta}s"


@patch('url_shortener_api.api.routes.settings.TRUST_PROXY', True)
class TestRateLimiting:
    """Tests for rate limiting on POST /api/urls/shorten."""

    def test_rate_limit_allows_under_limit(self, client: TestClient, mock_redis: MagicMock):
        # mock_redis.eval returns 0 for allowed
        mock_redis.eval.return_value = "0"
        
        for _ in range(4):
            resp = client.post(
                "/api/urls/shorten",
                json={"url": "https://example.com"},
                headers={"X-Forwarded-For": "192.168.1.1"}
            )
            assert resp.status_code == 200

    def test_rate_limit_rejects_over_per_minute(self, client: TestClient, mock_redis: MagicMock):
        # mock_redis.eval returns positive integer for rejected (retry_after)
        mock_redis.eval.return_value = "10"
        
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
            headers={"X-Forwarded-For": "192.168.1.2"}
        )
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers
        assert "per minute" in resp.json()["detail"]
        assert resp.headers["Retry-After"] == "10"

    def test_rate_limit_rejects_over_per_5hr(self, client: TestClient, mock_redis: MagicMock):
        # First call (per-minute) passes, second call (5hr) rejects
        mock_redis.eval.side_effect = ["0", "900"]
        
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
            headers={"X-Forwarded-For": "192.168.1.5"}
        )
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers
        assert "per 5 hours" in resp.json()["detail"]
        assert resp.headers["Retry-After"] == "900"

    def test_rate_limit_graceful_degradation(self, client: TestClient):
        # Without Redis set (mock_redis fixture isn't used here), it should allow requests
        # _redis will be None
        routes_module.set_redis_client(None)
        for _ in range(10):
            resp = client.post(
                "/api/urls/shorten",
                json={"url": "https://example.com"},
                headers={"X-Forwarded-For": "192.168.1.3"}
            )
            assert resp.status_code == 200

    def test_rate_limit_redis_failure_allows(self, client: TestClient, mock_redis: MagicMock):
        # If eval raises an exception, the request should be allowed (graceful degradation)
        mock_redis.eval.side_effect = Exception("Redis connection error")
        
        resp = client.post(
            "/api/urls/shorten",
            json={"url": "https://example.com"},
            headers={"X-Forwarded-For": "192.168.1.4"}
        )
        assert resp.status_code == 200


# ── GET /{short_code} tests ─────────────────────────────────────────


class TestRedirectEndpoint:
    """Tests for GET /{short_code}."""

    def _create_mapping(self, session: Session, **overrides) -> URLMapping:
        """Helper: insert a URLMapping directly into the test DB."""
        defaults = {
            "long_url": "https://example.com",
            "short_code": None,
            "clicks": 0,
        }
        defaults.update(overrides)
        mapping = URLMapping(**defaults)
        session.add(mapping)
        session.commit()
        session.refresh(mapping)

        # Generate short_code from id
        from url_shortener_api.core.base62 import encode

        mapping.short_code = encode(mapping.id)
        session.add(mapping)
        session.commit()
        session.refresh(mapping)
        return mapping

    def test_redirect_valid_code(self, client: TestClient, session: Session):
        """Valid, non-expired short code should return 302."""
        mapping = self._create_mapping(session)

        resp = client.get(f"/{mapping.short_code}", follow_redirects=False)
        assert resp.status_code == 302
        assert resp.headers["location"] == "https://example.com"

    def test_redirect_recaches_in_redis(
        self, client: TestClient, session: Session, mock_redis: MagicMock
    ):
        """Cache-miss redirect should re-cache the URL in Redis."""
        mapping = self._create_mapping(session)
        client.get(f"/{mapping.short_code}", follow_redirects=False)

        # Redis SET should have been called to re-cache
        mock_redis.set.assert_called()
        call_args = mock_redis.set.call_args
        assert call_args[0][0] == f"url:{mapping.short_code}"

    def test_redirect_increments_analytics(
        self, client: TestClient, session: Session, mock_redis: MagicMock
    ):
        """Redirect should INCR the analytics counter in Redis."""
        mapping = self._create_mapping(session)
        client.get(f"/{mapping.short_code}", follow_redirects=False)

        mock_redis.incr.assert_called_once_with(
            f"analytics:clicks:{mapping.short_code}"
        )

    def test_redirect_nonexistent_code(self, client: TestClient):
        """Non-existent short code should return 404."""
        resp = client.get("/ZZZZZ", follow_redirects=False)
        assert resp.status_code == 404

    def test_redirect_invalid_code_format(self, client: TestClient):
        """Invalid characters should return 404."""
        resp = client.get("/ab!cd", follow_redirects=False)
        assert resp.status_code == 404

    def test_redirect_expired_code(self, client: TestClient, session: Session):
        """Expired short code should return 404 (lazy enforcement)."""
        mapping = self._create_mapping(
            session,
            expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        )

        resp = client.get(f"/{mapping.short_code}", follow_redirects=False)
        assert resp.status_code == 404

    def test_no_db_write_on_redirect(self, client: TestClient, session: Session):
        """Redirect should NOT write to the database (per RULES.md)."""
        mapping = self._create_mapping(session)
        original_clicks = mapping.clicks

        client.get(f"/{mapping.short_code}", follow_redirects=False)

        # Refresh from DB — clicks should NOT have changed
        session.expire(mapping)
        refreshed = session.get(URLMapping, mapping.id)
        assert refreshed.clicks == original_clicks


class TestCronAnalyticsSync:
    """Tests for POST /api/cron/flush-analytics."""

    def test_flush_unauthorized(self, client: TestClient):
        resp = client.post("/api/cron/flush-analytics")
        assert resp.status_code == 401
        assert "Unauthorized" in resp.json()["detail"]

    def test_flush_authorized_success(

        self, client: TestClient, session: Session, mock_redis: MagicMock
    ):
        mapping = URLMapping(
            id=10005,
            short_code="002bI",
            long_url="https://example.com/analytics",
            clicks=10,
        )
        session.add(mapping)
        session.commit()

        mock_redis.keys.return_value = ["analytics:clicks:002bI"]
        mock_redis.eval.return_value = "5"

        headers = {"Authorization": f"Bearer {settings.CRON_SECRET}"}
        resp = client.post("/api/cron/flush-analytics", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"
        assert resp.json()["synced_records"] == 1

        session.expire(mapping)
        refreshed = session.get(URLMapping, mapping.id)
        assert refreshed.clicks == 15


class TestCronPurgeExpired:
    """Tests for POST /api/cron/purge-expired."""

    def test_purge_unauthorized(self, client: TestClient):
        resp = client.post("/api/cron/purge-expired")
        assert resp.status_code == 401

    def test_purge_expired_success(
        self, client: TestClient, session: Session, mock_redis: MagicMock
    ):
        now = datetime.now(timezone.utc)
        expired_mapping = URLMapping(
            id=10006,
            short_code="002bJ",
            long_url="https://example.com/expired",
            expires_at=now - timedelta(days=1),
        )
        active_mapping = URLMapping(
            id=10007,
            short_code="002bK",
            long_url="https://example.com/active",
            expires_at=now + timedelta(days=10),
        )
        session.add(expired_mapping)
        session.add(active_mapping)
        session.commit()

        headers = {"Authorization": f"Bearer {settings.CRON_SECRET}"}
        resp = client.post("/api/cron/purge-expired", headers=headers)

        assert resp.status_code == 200
        assert resp.json()["status"] == "success"
        assert resp.json()["purged_records"] == 1

        # Check that expired mapping is removed, active mapping is kept
        assert session.get(URLMapping, 10006) is None
        assert session.get(URLMapping, 10007) is not None
        mock_redis.delete.assert_called_once_with(
            "url:002bJ", "analytics:clicks:002bJ"
        )


class TestURLStats:
    """Tests for GET /api/urls/{short_code}/stats."""

    def test_stats_not_found(self, client: TestClient):
        resp = client.get("/api/urls/NONEX/stats")
        assert resp.status_code == 404

    def test_stats_success(
        self, client: TestClient, session: Session, mock_redis: MagicMock
    ):
        mapping = URLMapping(
            id=10008,
            short_code="002bL",
            long_url="https://example.com/stats-test",
            clicks=42,
        )
        session.add(mapping)
        session.commit()

        mock_redis.get.return_value = "8"

        resp = client.get(f"/api/urls/{mapping.short_code}/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["short_code"] == "002bL"
        assert data["original_url"] == "https://example.com/stats-test"
        assert data["total_clicks"] == 50  # 42 + 8

