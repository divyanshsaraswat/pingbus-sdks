import hmac
import hashlib
import time
import random
import asyncio
from typing import Callable, Any

def verify_signature(body: str, signature: str, api_key: str) -> bool:
    expected = hmac.new(
        api_key.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

async def with_retry(fn: Callable, max_retries: int = 3):
    initial_delay = 1.0
    max_delay = 30.0
    backoff_factor = 2.0
    jitter = 1.0
    
    attempt = 0
    while True:
        try:
            return await fn()
        except Exception as e:
            status = getattr(e, 'status_code', None)
            is_transient = status in [429, 503, 504]
            
            if not is_transient or attempt >= max_retries:
                raise e
            
            wait_time = min(max_delay, initial_delay * (backoff_factor ** attempt)) + random.uniform(0, jitter)
            await asyncio.sleep(wait_time)
            attempt += 1
