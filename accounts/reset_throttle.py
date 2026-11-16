"""Best-effort reset limits using Django cache atomic add, independent of users."""
import time

from django.core.cache import cache
from django.utils.crypto import salted_hmac

WINDOW = 60
IP_LIMIT = 10


def allow_reset(request, email):
    # Use REMOTE_ADDR only; forwarded headers require a trusted proxy policy.
    source = request.META.get('REMOTE_ADDR', '')
    digest = lambda value: salted_hmac('password-reset-throttle', value).hexdigest()
    bucket = int(time.time() // WINDOW)
    # Bound work across different targets, including unknown addresses.
    for slot in range(IP_LIMIT):
        if cache.add(f'reset:ip:{digest(source)}:{bucket}:{slot}', True, WINDOW * 2):
            break
    else:
        return False
    # Same normalized address across sources gets one attempt per minute.
    return cache.add(f'reset:email:{digest(email)}', True, WINDOW)
