"""Purpose-specific reset links, invalidated by a successful password change."""
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import User


class ResetTokenGenerator(PasswordResetTokenGenerator):
    key_salt = 'accounts.password_reset.ResetTokenGenerator'


tokens = ResetTokenGenerator()


def send_reset(user):
    link = settings.PASSWORD_RESET_ORIGIN.rstrip('/') + '/reset-password#' + urlencode({
        'uid': urlsafe_base64_encode(force_bytes(user.pk)), 'token': tokens.make_token(user),
    })
    if send_mail('Reset your Cali Queue password',
                 f'Reset your password: {link}\nThis single-use link expires in one hour. '
                 'If you did not request this, ignore this email.',
                 settings.DEFAULT_FROM_EMAIL, [user.email]) != 1:
        raise RuntimeError('Email backend did not accept the message.')


def reset_user(uid, token):
    if not isinstance(uid, str) or not isinstance(token, str) or len(uid) > 100 or len(token) > 100:
        return None
    try:
        user = User.objects.get(pk=urlsafe_base64_decode(uid).decode(), is_active=True)
    except (ValueError, UnicodeDecodeError, OverflowError, User.DoesNotExist):
        return None
    return user if tokens.check_token(user, token) else None
