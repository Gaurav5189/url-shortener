import logging
from sqlmodel import Session, select
from url_shortener_api.db.models import URLMapping

logger = logging.getLogger(__name__)

def sync_analytics_to_db(redis_client, db_session: Session) -> dict:
    """Sync pending clicks from Upstash Redis to Turso SQLite."""
    if not redis_client:
        return {"status": "skipped", "reason": "Redis not configured"}

    try:
        # 1. Fetch all click tracking keys from Redis
        keys = redis_client.keys("analytics:clicks:*")
        
        if not keys:
            return {"status": "success", "synced_records": 0, "reason": "no data to sync"}

        synced_count = 0

        # Atomic read and delete using a simple Lua script
        lua_script = """
        local count = redis.call('GET', KEYS[1])
        if count then
            redis.call('DEL', KEYS[1])
            return count
        end
        return 0
        """

        for key in keys:
            # Extract short code from key (e.g., "analytics:clicks:002bI")
            short_code = key.split(":")[-1]
            
            clicks = redis_client.eval(lua_script, [key], [])
            
            if clicks and int(clicks) > 0:
                clicks_int = int(clicks)
                
                # Query by short_code using O(1) Unique Index retrieval
                statement = select(URLMapping).where(URLMapping.short_code == short_code)
                mapping = db_session.exec(statement).first()
                
                if mapping:
                    mapping.clicks += clicks_int
                    db_session.add(mapping)
                    synced_count += 1
                else:
                    logger.warning("Tried to sync clicks for unknown short_code: %s", short_code)
        
        # Flush all updates to Turso DB in a single transaction
        db_session.commit()
        
        return {"status": "success", "synced_records": synced_count}
        
    except Exception as e:
        logger.error("Failed to sync analytics: %s", str(e))
        db_session.rollback()
        raise


def purge_expired_urls(redis_client, db_session: Session) -> dict:
    """Purge expired URLs from Turso SQLite and evict corresponding Redis cache."""
    from datetime import datetime, timezone

    try:
        now = datetime.now(timezone.utc)
        statement = select(URLMapping).where(
            URLMapping.expires_at.is_not(None),
            URLMapping.expires_at <= now,
            URLMapping.short_code.is_not(None),
        )
        expired_records = db_session.exec(statement).all()

        if not expired_records:
            return {"status": "success", "purged_records": 0}

        purged_count = len(expired_records)
        for record in expired_records:
            short_code = record.short_code
            if redis_client and short_code:
                try:
                    redis_client.delete(
                        f"url:{short_code}",
                        f"analytics:clicks:{short_code}",
                    )
                except Exception as e:
                    logger.warning(
                        "Failed to evict Redis cache for expired URL %s: %s",
                        short_code,
                        str(e),
                    )
            db_session.delete(record)

        db_session.commit()
        return {"status": "success", "purged_records": purged_count}

    except Exception as e:
        logger.error("Failed to purge expired URLs: %s", str(e))
        db_session.rollback()
        raise

