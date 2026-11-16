"""Single-use email verification; only token digests are stored."""
import hashlib
import secrets
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import EmailVerification, User


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def send_verification(user):
    with transaction.atomic():
        user = User.objects.select_for_update().get(pk=user.pk)
        if user.isEmailVerified or not user.is_active:
            return
        previous = EmailVerification.objects.filter(user=user).first()
        if previous and previous.sent_at > timezone.now() - timedelta(seconds=60):
            return
        token = secrets.token_urlsafe(32)
        link = settings.EMAIL_VERIFICATION_ORIGIN.rstrip('/') + '/verify-email#' + urlencode({'token': token})
        # Roll back replacement if delivery fails, preserving any previously sent link.
        EmailVerification.objects.update_or_create(user=user, defaults={
            'token_hash': digest(token), 'email': user.email, 'sent_at': timezone.now(),
        })
        if send_mail('Verify your Cali Queue email',
                     f'Confirm your college email: {link}\nThis single-use link expires in 24 hours.',
                     settings.DEFAULT_FROM_EMAIL, [user.email]) != 1:
            raise RuntimeError('Email backend did not accept the message.')


def verify(token):
    if not isinstance(token, str) or len(token) != 43:
        return False
    with transaction.atomic():
        record = EmailVerification.objects.filter(token_hash=digest(token)).first()
        if not record:
            return False
        user = User.objects.select_for_update().get(pk=record.user_id)
        # Conditional deletion provides a single winner even for concurrent requests.
        deleted, _ = EmailVerification.objects.filter(
            pk=record.pk, token_hash=digest(token),
            sent_at__gt=timezone.now() - timedelta(hours=24), email=user.email,
            user__is_active=True, user__isEmailVerified=False,
        ).delete()
        if not deleted:
            return False
        user.isEmailVerified = True
        user.save(update_fields=['isEmailVerified'])
        return True
