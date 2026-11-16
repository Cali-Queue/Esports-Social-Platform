"""Backend signup email eligibility validation (not ownership verification)."""

import re

from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from .college_domains import APPROVED_COLLEGE_DOMAINS


# Matches the existing User.email max_length; no schema change is required.
MAX_EMAIL_LENGTH = 100
DNS_LABEL = re.compile(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?', re.ASCII)


def validate_college_email(value):
    """Raise ValidationError unless an email belongs to an approved domain.

    Outer whitespace is ignored, consistent with signup. Domain matching is
    case-insensitive; Unicode domains and trailing dots are deliberately rejected.
    """
    if not isinstance(value, str):
        raise ValidationError('Enter a valid college email.', code='invalid')
    email = value.strip()
    if not email:
        raise ValidationError('Enter your college email.', code='required')
    if len(email) > MAX_EMAIL_LENGTH:
        raise ValidationError(
            f'Email must be {MAX_EMAIL_LENGTH} characters or fewer.', code='max_length'
        )

    validate_email(email)
    domain = email.rsplit('@', 1)[1]
    if not domain.isascii() or any(
        DNS_LABEL.fullmatch(label.lower()) is None for label in domain.split('.')
    ):
        raise ValidationError('Enter a valid college email domain.', code='invalid')
    domain = domain.lower()
    if not any(
        domain == approved or domain.endswith('.' + approved)
        for approved in APPROVED_COLLEGE_DOMAINS
    ):
        raise ValidationError(
            'Use an email from an approved California college.', code='unapproved_domain'
        )
