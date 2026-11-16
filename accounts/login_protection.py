#Limits repeated failed logins (brute-force protection) for login_view in auth_views.py.
#5 failed attempts within 15 minutes locks that email out for 15 minutes.
#A successful login clears the email's failed attempts.

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import FailedLoginAttempt, LoginLockout

MAX_FAILED_ATTEMPTS = 5
ATTEMPT_WINDOW = timedelta(minutes=15)
LOCKOUT_DURATION = timedelta(minutes=15)


#returns when the lockout ends, or None if this email can try to log in
def locked_until(email):
    lockout = LoginLockout.objects.filter(email=email).first()
    if lockout is None:
        return None
    if lockout.locked_until > timezone.now():
        return lockout.locked_until
    # lockout is over, so start the count fresh
    _clear(email)
    return None


#saves a failed attempt. returns when the lockout ends if this attempt hit the limit, otherwise None
def record_failure(email, ip_address=None):
    now = timezone.now()
    with transaction.atomic():
        FailedLoginAttempt.objects.create(email=email, ip_address=ip_address, attempted_at=now)
        recent = FailedLoginAttempt.objects.filter(email=email, attempted_at__gt=now - ATTEMPT_WINDOW).count()
        if recent < MAX_FAILED_ATTEMPTS:
            return None
        until = now + LOCKOUT_DURATION
        LoginLockout.objects.update_or_create(email=email, defaults={'locked_until': until})
        return until


#called after a successful login
def clear_failures(email):
    _clear(email)


def _clear(email):
    FailedLoginAttempt.objects.filter(email=email).delete()
    LoginLockout.objects.filter(email=email).delete()


#the message shown on the login page while locked out, e.g. "Try again in 14 minutes."
def lockout_message(until):
    seconds = max(0, (until - timezone.now()).total_seconds())
    minutes = max(1, -(-int(seconds) // 60))  # round up so we never say "0 minutes"
    unit = 'minute' if minutes == 1 else 'minutes'
    return f'Too many failed login attempts. For your security, login is paused. Try again in {minutes} {unit}.'
