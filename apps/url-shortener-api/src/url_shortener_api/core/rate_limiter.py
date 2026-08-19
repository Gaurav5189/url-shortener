import time
from typing import Tuple
from fastapi import Request
from upstash_redis import Redis

# Sliding Window Counter Lua Script
# KEYS[1]: Current window key
# KEYS[2]: Previous window key
# ARGV[1]: Window size in seconds
# ARGV[2]: Request limit
# ARGV[3]: Current timestamp in seconds
_SLIDING_WINDOW_LUA = """
local current_key = KEYS[1]
local previous_key = KEYS[2]
local window_size = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Get current counts
local current_count = tonumber(redis.call("GET", current_key) or "0")
local previous_count = tonumber(redis.call("GET", previous_key) or "0")

-- Calculate the exact time into the current window
local time_into_window = now % window_size

-- Calculate overlap weight (e.g., if we are 15s into a 60s window, weight of prev is 45/60 = 0.75)
local previous_weight = (window_size - time_into_window) / window_size

-- Estimated count over the sliding window
local estimated_count = current_count + (previous_count * previous_weight)

if estimated_count >= limit then
    return 0 -- Rejected
end

-- Increment current window
redis.call("INCR", current_key)
-- Set expiry for twice the window size so it can act as the previous window next time
redis.call("EXPIRE", current_key, window_size * 2)

return 1 -- Allowed
"""

def get_client_ip(request: Request) -> str:
    """
    Extract the real client IP, prioritizing load balancer headers.
    
    1. X-Forwarded-For: Comma-separated list (client, proxy1, proxy2...). We take the first.
    2. X-Real-IP: Common Nginx/App Service header.
    3. request.client.host: Direct connection IP (fallback).
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Take the leftmost IP in case of multiple proxies
        return forwarded_for.split(",")[0].strip()
        
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
        
    if request.client and request.client.host:
        return request.client.host
        
    return "unknown"

def check_rate_limit(redis_client: Redis, client_id: str, window_sec: int, limit: int) -> bool:
    """
    Check if a client has exceeded the rate limit using a sliding window counter.
    Returns True if allowed, False if rejected.
    """
    now = int(time.time())
    current_bucket = now // window_sec
    previous_bucket = current_bucket - 1
    
    current_key = f"rl:{client_id}:{window_sec}:{current_bucket}"
    previous_key = f"rl:{client_id}:{window_sec}:{previous_bucket}"
    
    try:
        # upstash-redis eval takes (script, keys, args)
        result = redis_client.eval(
            _SLIDING_WINDOW_LUA,
            [current_key, previous_key],
            [window_sec, limit, now]
        )
        return int(result) == 1
    except Exception as e:
        # Graceful degradation on Redis failure
        import logging
        logging.warning(f"Rate limiting Redis eval failed, allowing request: {e}")
        return True

def check_shorten_rate_limits(
    redis_client: Redis | None, 
    client_ip: str, 
    limit_per_min: int, 
    limit_per_5hr: int
) -> Tuple[bool, str, int]:
    """
    Check both per-minute and per-5-hour limits.
    Returns (allowed, reason, retry_after_seconds)
    """
    if redis_client is None:
        return True, "", 0
        
    # Check per-minute limit first (60 seconds)
    if not check_rate_limit(redis_client, client_ip, 60, limit_per_min):
        return False, "per_minute", 60
        
    # Check per-5-hour limit (18000 seconds)
    if not check_rate_limit(redis_client, client_ip, 18000, limit_per_5hr):
        return False, "per_5hr", 18000
        
    return True, "", 0
