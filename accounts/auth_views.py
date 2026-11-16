#JSON auth endpoints for the Next.js frontend. Session cookie based.
#The frontend should GET /api/auth/csrf/ once, then send the csrftoken cookie
#value back in the X-CSRFToken header on every POST.

import json
import logging
import time

from django.conf import settings

from .email_verification import send_verification, verify

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import User, UserProfile
from .validators import validate_college_email

#keep these in sync with src/app/(auth)/signup/page.jsx
MIN_AGE = 13
MAX_AGE = 120
#gamertag doubles as the profile handle, so it has to fit UserProfile.handle (30 chars)
GAMERTAG_MAX = 30


#parses the request body as JSON. returns None if it's not valid JSON or not an object
def _read_json(request):
    try:
        data = json.loads(request.body or b'{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return data if isinstance(data, dict) else None


#gets a trimmed string field, or '' if it's missing or not a string
def _text(data, key):
    value = data.get(key, '')
    return value.strip() if isinstance(value, str) else ''


#the user info sent back to the frontend. never includes the password hash
def _user_json(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.id,
        'email': user.email,
        'name': user.real_name,
        'age': user.age,
        'isEmailVerified': user.isEmailVerified,
        'role': user.role,
        'school': user.school.school if user.school else None,
        'gamertag': profile.gamertag if profile else None,
        'handle': profile.handle if profile else None,
    }


#GET /api/auth/csrf/ - sets the csrftoken cookie the frontend needs before any POST
@require_GET
@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set.'})


#POST /api/auth/signup/ - body: { name, age, email, gamertag, password }
#creates the account + starter profile and logs the user in.
#201 with { user } on success, 400 with { errors: { field: message } } on bad input
@require_POST
def signup(request):
    data = _read_json(request)
    if data is None:
        return JsonResponse({'detail': 'Request body must be a JSON object.'}, status=400)

    name = _text(data, 'name')
    email = _text(data, 'email').lower()
    gamertag = _text(data, 'gamertag')
    password = data.get('password') if isinstance(data.get('password'), str) else ''
    age = data.get('age')

    # same messages as the signup form so the frontend can show them as-is
    errors = {}

    # name: required, fits User.real_name
    if not name:
        errors['name'] = 'Enter your full name.'
    elif len(name) > 200:
        errors['name'] = 'Name must be 200 characters or fewer.'

    # age: whole number between MIN_AGE and MAX_AGE (accepts 19 or "19")
    if age is None or age == '':
        errors['age'] = 'Enter your age.'
    else:
        try:
            age = int(str(age).strip())
        except ValueError:
            errors['age'] = 'Age must be a whole number.'
        else:
            if age < MIN_AGE:
                errors['age'] = f'You must be at least {MIN_AGE} to sign up.'
            elif age > MAX_AGE:
                errors['age'] = 'Enter a valid age.'

    # Validate the raw value too, so non-string inputs cannot be coerced.
    try:
        validate_college_email(data.get('email', ''))
    except ValidationError as exc:
        errors['email'] = ' '.join(exc.messages)
    else:
        if User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'An account with this email already exists.'

    # gamertag: required and unique, since it becomes the profile handle
    if not gamertag:
        errors['gamertag'] = 'Choose a gamertag.'
    elif len(gamertag) > GAMERTAG_MAX:
        errors['gamertag'] = f'Gamertag must be {GAMERTAG_MAX} characters or fewer.'
    elif UserProfile.objects.filter(handle__iexact=gamertag).exists():
        errors['gamertag'] = 'That gamertag is already taken.'

    # password: runs AUTH_PASSWORD_VALIDATORS from settings (length, common, numeric, similarity)
    if not password:
        errors['password'] = 'Create a password.'
    else:
        try:
            validate_password(password, user=User(email=email, real_name=name))
        except ValidationError as exc:
            errors['password'] = ' '.join(exc.messages)

    if errors:
        return JsonResponse({'errors': errors}, status=400)

    # atomic so we never end up with a user that has no profile (or the other way around)
    with transaction.atomic():
        user = User.objects.create_user(email=email, password=password, real_name=name, age=age)
        UserProfile.objects.create(user=user, gamertag=gamertag, handle=gamertag.lower())

    # Keep a restricted session so delivery failures can be retried.
    email_sent = _deliver(user)
    login(request, user)
    return JsonResponse({'user': _user_json(user), 'emailSent': email_sent}, status=201)


#POST /api/auth/login/ - body: { email, password }
#200 with { user } and starts a session, 401 if the email/password is wrong
@require_POST
def login_view(request):
    data = _read_json(request)
    if data is None:
        return JsonResponse({'detail': 'Request body must be a JSON object.'}, status=400)

    email = _text(data, 'email').lower()
    password = data.get('password') if isinstance(data.get('password'), str) else ''
    if not email or not password:
        return JsonResponse({'detail': 'Enter your email and password.'}, status=400)

    # checks the hashed password, returns None for wrong creds or inactive users
    user = authenticate(request, email=email, password=password)
    if user is None:
        # same message for wrong email and wrong password so emails can't be probed
        return JsonResponse({'detail': 'Invalid email or password.'}, status=401)

    login(request, user)
    return JsonResponse({'user': _user_json(user)})


#POST /api/auth/logout/ - ends the session
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'detail': 'Logged out.'})


#GET /api/auth/me/ - returns the logged-in user, or 401 if there's no session
@require_GET
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Not logged in.'}, status=401)
    return JsonResponse({'user': _user_json(request.user)})


def _deliver(user):
    try:
        send_verification(user)
        return True
    except Exception:
        # Do not log tokens, message bodies, addresses, or backend credentials.
        logging.getLogger(__name__).error('Verification email delivery failed.')
        return False


@require_POST
def resend_verification(request):
    # No email lookup: only the session owner can request mail for their account.
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Not logged in.'}, status=401)
    if not _deliver(request.user):
        return JsonResponse({'detail': 'Unable to send email. Please try again.'}, status=503)
    return JsonResponse({'detail': 'If verification is needed, a link will be sent. Please allow 60 seconds between requests.'})


@require_POST
def verify_email(request):
    data = _read_json(request)
    if data is None or not verify(data.get('token')):
        return JsonResponse({'detail': 'This verification link is invalid or expired.'}, status=400)
    return JsonResponse({'detail': 'Email verified.'})


@require_POST
def request_password_reset(request):
    from .password_reset import send_reset
    data = _read_json(request)
    if data is None:
        return JsonResponse({'detail': 'Request body must be a JSON object.'}, status=400)
    from .reset_throttle import allow_reset
    started = time.monotonic()
    email = _text(data, 'email').lower()
    if allow_reset(request, email):
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user and user.has_usable_password():
            try:
                send_reset(user)
            except Exception:
                logging.getLogger(__name__).error('Password reset email delivery failed.')
    # Equalize ordinary delivery/lookup latency for known, unknown and limited requests.
    time.sleep(max(0, settings.PASSWORD_RESET_RESPONSE_SECONDS - (time.monotonic() - started)))
    # Do not expose account existence or email delivery status.
    return JsonResponse({'detail': 'If an account exists, a password reset link will be sent to that address.'})


@require_POST
def reset_password(request):
    from .password_reset import reset_user
    data = _read_json(request)
    invalid = {'detail': 'This password reset link is invalid or expired. Request a new link.'}
    if data is None:
        return JsonResponse(invalid, status=400)
    with transaction.atomic():
        user = reset_user(data.get('uid'), data.get('token'))
        if user is None:
            return JsonResponse(invalid, status=400)
        password = data.get('password')
        errors = {}
        if not isinstance(password, str) or not password:
            errors['password'] = 'Enter a new password.'
        else:
            try:
                validate_password(password, user=user)
            except ValidationError as exc:
                errors['password'] = ' '.join(exc.messages)
        if password != data.get('confirmPassword'):
            errors['confirmPassword'] = 'Passwords do not match.'
        if errors:
            return JsonResponse({'errors': errors}, status=400)
        previous = user.password
        user.set_password(password)
        # Only one concurrent request can replace the hash that validated the token.
        if not User.objects.filter(pk=user.pk, password=previous, email=user.email,
                                   is_active=True).update(password=user.password):
            return JsonResponse(invalid, status=400)
        # Existing sessions fail Django's auth hash check on their next request.
    return JsonResponse({'detail': 'Password reset. Log in with your new password.'})
