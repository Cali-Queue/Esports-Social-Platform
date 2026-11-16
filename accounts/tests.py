from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.contrib.sessions.models import Session
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse

from .models import FriendRequest, Schools, User, UserProfile
from .validators import validate_college_email


class CollegeEmailValidatorTests(SimpleTestCase):
    def test_accepts_root_subdomains_and_case(self):
        for email in (
            'student@csus.edu', 'student@mail.csus.edu',
            'student@dept.mail.csus.edu', ' Student@MAIL.CSUS.EDU ',
        ):
            with self.subTest(email=email):
                validate_college_email(email)

    def test_rejects_invalid_unapproved_and_lookalike_domains(self):
        for email in (
            'student@unapproved.edu', 'student@csus.com',
            'student@fakecsus.edu', 'student@csus.edu.attacker.edu',
            'student@csus-edu.edu', 'student@cśus.edu',
            'student@ｍail.csus.edu', 'student@K.csus.edu',
            'student@xn--csus-example.edu',
            'student@mail..csus.edu', 'student@-mail.csus.edu',
            'student@mail-.csus.edu', 'student@mail_box.csus.edu',
            'student@csus.edu.', 'student@' + 'a' * 64 + '.csus.edu',
            'student@@csus.edu', 'student csus.edu', '@csus.edu',
            'student\n@csus.edu', 'student@[127.0.0.1]',
        ):
            with self.subTest(email=email), self.assertRaises(ValidationError):
                validate_college_email(email)

    def test_rejects_missing_and_non_string_inputs(self):
        for value in ('', '   ', None, 123, True, [], {}, ['student@csus.edu']):
            with self.subTest(value=value), self.assertRaises(ValidationError):
                validate_college_email(value)

    def test_existing_email_length_boundary(self):
        email = 'a' * 64 + '@' + 'b' * 26 + '.csus.edu'
        self.assertEqual(len(email), 100)
        validate_college_email(email)
        with self.assertRaisesMessage(ValidationError, '100 characters or fewer'):
            validate_college_email(email.replace('@', '@b', 1))


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class CollegeEmailSignupTests(TestCase):
    def signup(self, **overrides):
        payload = {
            'name': 'Campus Player', 'age': 19, 'email': 'student@csus.edu',
            'gamertag': 'campusplayer', 'password': 'Q7!mV2#rT9$xL4',
        }
        payload.update(overrides)
        return self.client.post(reverse('auth_signup'), payload, content_type='application/json')

    def test_rejected_signup_creates_no_user_profile_or_session(self):
        for email in (
            '', None, 123, True, [], {}, 'student@unapproved.edu',
            'student@fakecsus.edu', 'student@csus.edu.attacker.edu',
            'student@mail..csus.edu', 'student@ｍail.csus.edu',
            'a' * 92 + '@csus.edu',
        ):
            with self.subTest(email=email):
                response = self.signup(email=email)
                self.assertEqual(response.status_code, 400)
                self.assertTrue(response.json()['errors']['email'])
                self.assertFalse(User.objects.exists())
                self.assertFalse(UserProfile.objects.exists())
                self.assertFalse(Session.objects.exists())
                self.assertNotIn('sessionid', self.client.cookies)

    def test_missing_email_returns_required_error(self):
        response = self.client.post(
            reverse('auth_signup'), {}, content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['errors']['email'], 'Enter your college email.')
        self.assertFalse(User.objects.exists())
        self.assertFalse(UserProfile.objects.exists())
        self.assertFalse(Session.objects.exists())

    def test_success_normalizes_email_and_keeps_ownership_unverified(self):
        response = self.signup(email=' Student@MAIL.CSUS.EDU ')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get()
        self.assertEqual(user.email, 'student@mail.csus.edu')
        self.assertFalse(user.isEmailVerified)
        self.assertFalse(response.json()['user']['isEmailVerified'])
        self.assertEqual(UserProfile.objects.get().user, user)
        self.assertTrue(user.check_password('Q7!mV2#rT9$xL4'))
        self.assertEqual(self.client.session['_auth_user_id'], str(user.pk))

    def test_duplicate_email_check_remains_case_insensitive(self):
        User.objects.create_user(email='student@csus.edu', password='existing-password')
        response = self.signup(email='STUDENT@CSUS.EDU')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()['errors']['email'], 'An account with this email already exists.'
        )
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(UserProfile.objects.exists())


class FriendRequestTests(TestCase):
    def setUp(self):
        school = Schools.objects.create(school='Sacramento State')
        self.kai = User.objects.create(email='kai@csus.edu', real_name='Kai', school=school)
        self.astra = User.objects.create(email='astra@csus.edu', real_name='Astra', school=school)

    def test_send_creates_pending_request_for_recipient(self):
        FriendRequest.send(self.kai, self.astra)
        pending = self.astra.received_friend_requests.filter(status='pending')
        self.assertEqual(pending.count(), 1)
        self.assertEqual(pending.first().sender, self.kai)

    def test_cannot_send_to_self(self):
        with self.assertRaises(ValidationError):
            FriendRequest.send(self.kai, self.kai)
        with self.assertRaises(IntegrityError), transaction.atomic():
            FriendRequest.objects.create(sender=self.kai, recipient=self.kai)

    def test_cannot_send_second_request_while_pending(self):
        FriendRequest.send(self.kai, self.astra)
        with self.assertRaises(ValidationError):
            FriendRequest.send(self.kai, self.astra)
        # the other direction counts as the same pair
        with self.assertRaises(ValidationError):
            FriendRequest.send(self.astra, self.kai)
        with self.assertRaises(IntegrityError), transaction.atomic():
            FriendRequest.objects.create(sender=self.astra, recipient=self.kai)

    def test_can_send_again_after_previous_request_is_answered(self):
        FriendRequest.send(self.kai, self.astra).respond('declined')
        FriendRequest.send(self.kai, self.astra)
        self.assertEqual(FriendRequest.pending_between(self.kai, self.astra).count(), 1)

    def test_cannot_answer_twice(self):
        request = FriendRequest.send(self.kai, self.astra)
        request.respond('accepted')
        with self.assertRaises(ValidationError):
            request.respond('declined')


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class SessionAuthenticationTests(TestCase):
    def setUp(self):
        from django.test import Client
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email='player@csus.edu', password='session-password', real_name='Player', age=20,
        )
        UserProfile.objects.create(user=self.user, handle='player', gamertag='PlayerOne')

    def post(self, name, data=None):
        self.client.get(reverse('auth_csrf'))
        return self.client.post(
            reverse(name), data or {}, content_type='application/json',
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value,
        )

    def login(self):
        return self.post('auth_login', {'email': ' PLAYER@CSUS.EDU ', 'password': 'session-password'})

    def test_login_and_current_user_persist_across_requests(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        expected = response.json()['user']
        self.assertEqual(expected['handle'], 'player')
        self.assertEqual(expected['email'], self.user.email)
        self.assertNotIn('password', expected)
        for _ in range(2):
            response = self.client.get(reverse('auth_me'))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['user'], expected)

    def test_logout_invalidates_session_and_old_cookie(self):
        from django.test import Client
        self.login()
        old_session = self.client.cookies['sessionid'].value
        self.assertEqual(self.post('auth_logout').status_code, 200)
        self.assertFalse(Session.objects.filter(session_key=old_session).exists())
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 401)
        replay = Client()
        replay.cookies['sessionid'] = old_session
        self.assertEqual(replay.get(reverse('auth_me')).status_code, 401)

    def test_unauthorized_and_invalid_credentials(self):
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 401)
        for email, password in [('player@csus.edu', 'wrong'), ('missing@csus.edu', 'session-password')]:
            response = self.post('auth_login', {'email': email, 'password': password})
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()['detail'], 'Invalid email or password.')
        self.assertEqual(self.post('auth_login').status_code, 400)
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 401)

    def test_login_and_logout_require_csrf_and_post(self):
        for name in ('auth_login', 'auth_logout'):
            self.assertEqual(self.client.get(reverse(name)).status_code, 405)
            self.assertEqual(self.client.post(reverse(name), {}, content_type='application/json').status_code, 403)
        self.login()
        response = self.client.post(reverse('auth_logout'), {}, content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 200)

    def test_inactive_user_cannot_log_in(self):
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.login().status_code, 401)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
                   PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class EmailVerificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='verify@csus.edu', password='password')
        self.client.force_login(self.user)

    def token(self):
        from django.core import mail
        from urllib.parse import parse_qs
        return parse_qs(mail.outbox[-1].body.split('#')[1].split('\n')[0])['token'][0]

    def send(self):
        return self.client.post(reverse('auth_resend_verification'), {}, content_type='application/json')

    def verify(self, token):
        return self.client.post(reverse('auth_verify_email'), {'token': token}, content_type='application/json')

    def test_valid_single_use_and_no_plaintext_storage(self):
        from .models import EmailVerification
        self.assertEqual(self.send().status_code, 200)
        token = self.token()
        self.assertNotEqual(EmailVerification.objects.get().token_hash, token)
        self.assertEqual(self.verify(token).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.isEmailVerified)
        self.assertEqual(self.verify(token).status_code, 400)
        self.assertFalse(EmailVerification.objects.exists())

    def test_expired_boundary_tampered_and_malformed(self):
        from datetime import timedelta
        from unittest.mock import patch
        from django.utils import timezone
        from .models import EmailVerification
        self.send()
        token = self.token()
        for value in (token + 'x', 'x' * 43, None, {}, 12):
            self.assertEqual(self.verify(value).status_code, 400)
        sent_at = EmailVerification.objects.get().sent_at
        with patch('accounts.email_verification.timezone.now', return_value=sent_at + timedelta(hours=24)):
            self.assertEqual(self.verify(token).status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.isEmailVerified)

    def test_resend_cooldown_and_replacement(self):
        from datetime import timedelta
        from django.core import mail
        from django.utils import timezone
        from .models import EmailVerification
        self.send()
        old = self.token()
        self.send()
        self.assertEqual(len(mail.outbox), 1)
        EmailVerification.objects.update(sent_at=timezone.now() - timedelta(minutes=2))
        self.send()
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(self.verify(old).status_code, 400)
        self.assertEqual(self.verify(self.token()).status_code, 200)
        self.send()
        self.assertEqual(len(mail.outbox), 2)

    def test_failure_preserves_previous_link(self):
        from datetime import timedelta
        from unittest.mock import patch
        from django.utils import timezone
        from .models import EmailVerification
        self.send()
        token = self.token()
        EmailVerification.objects.update(sent_at=timezone.now() - timedelta(minutes=2))
        for result in (RuntimeError('delivery failed'), 0):
            kwargs = {'side_effect': result} if isinstance(result, Exception) else {'return_value': result}
            with patch('accounts.email_verification.send_mail', **kwargs):
                self.assertEqual(self.send().status_code, 503)
        self.assertEqual(self.verify(token).status_code, 200)

    def test_signup_delivery_failure_keeps_recoverable_unverified_session(self):
        from unittest.mock import patch
        from .models import EmailVerification
        with patch('accounts.email_verification.send_mail', side_effect=RuntimeError()):
            response = self.client.post(reverse('auth_signup'), {
                'name': 'Player', 'age': 20, 'email': 'new@csus.edu',
                'gamertag': 'newplayer', 'password': 'Q7!mV2#rT9$xL4',
            }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.json()['emailSent'])
        self.assertFalse(response.json()['user']['isEmailVerified'])
        self.assertFalse(EmailVerification.objects.exists())
        self.assertEqual(self.send().status_code, 200)

    def test_resend_does_not_lookup_supplied_email(self):
        from django.test import Client
        from django.core import mail
        anonymous = Client()
        responses = [anonymous.post(reverse('auth_resend_verification'), {'email': email},
                                    content_type='application/json')
                     for email in (self.user.email, 'absent@csus.edu')]
        self.assertEqual(responses[0].status_code, 401)
        self.assertEqual(responses[0].content, responses[1].content)
        self.client.post(reverse('auth_resend_verification'), {'email': 'absent@csus.edu'},
                         content_type='application/json')
        self.assertEqual(mail.outbox[-1].to, [self.user.email])

    def test_methods_csrf_and_restricted_session(self):
        from django.test import Client
        secure = Client(enforce_csrf_checks=True)
        secure.force_login(self.user)
        for name in ('auth_verify_email', 'auth_resend_verification'):
            self.assertEqual(secure.get(reverse(name)).status_code, 405)
            self.assertEqual(secure.post(reverse(name), {}, content_type='application/json').status_code, 403)
        self.assertEqual(self.client.get('/api/discover/players/').status_code, 403)
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 200)

    def test_changed_email_or_inactive_account_cannot_verify(self):
        self.send()
        token = self.token()
        self.user.email = 'changed@csus.edu'
        self.user.save()
        self.assertEqual(self.verify(token).status_code, 400)
        self.user.email = 'verify@csus.edu'
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.verify(token).status_code, 400)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
                   PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='reset@csus.edu', password='Old!p8Vx2#kL', real_name='Player')

    def request_link(self, email='reset@csus.edu'):
        return self.client.post(reverse('auth_forgot_password'), {'email': email}, content_type='application/json')

    def link(self):
        from django.core import mail
        from urllib.parse import parse_qs
        return {key: values[0] for key, values in parse_qs(mail.outbox[-1].body.split('#')[1].split('\n')[0]).items()}

    def reset(self, credentials=None, **changes):
        data = {**(credentials or self.link()), 'password': 'New!q9Zr4#vK', 'confirmPassword': 'New!q9Zr4#vK', **changes}
        return self.client.post(reverse('auth_reset_password'), data, content_type='application/json')

    def test_generic_requests_and_delivery_failures(self):
        from django.core import mail
        from unittest.mock import patch
        known = self.request_link(' RESET@CSUS.EDU ')
        unknown = self.request_link('absent@csus.edu')
        self.assertEqual(known.status_code, 200)
        self.assertEqual(known.content, unknown.content)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user.email])
        for outcome in (RuntimeError(), 0):
            kwargs = {'side_effect': outcome} if isinstance(outcome, Exception) else {'return_value': outcome}
            with patch('accounts.password_reset.send_mail', **kwargs):
                self.assertEqual(self.request_link().content, known.content)
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.request_link().content, known.content)
        self.assertEqual(len(mail.outbox), 1)
        self.assertNotIn(self.link()['token'], known.content.decode())

    def test_reset_single_use_sessions_login_and_verification_restrictions(self):
        from django.test import Client
        other = Client()
        self.client.force_login(self.user)
        other.force_login(self.user)
        self.request_link()
        credentials = self.link()
        self.assertEqual(self.reset(credentials).status_code, 200)
        self.assertEqual(self.reset(credentials).status_code, 400)
        self.assertEqual(self.client.get(reverse('auth_me')).status_code, 401)
        self.assertEqual(other.get(reverse('auth_me')).status_code, 401)
        self.user.refresh_from_db()
        self.assertFalse(self.user.isEmailVerified)
        self.assertTrue(self.user.check_password('New!q9Zr4#vK'))
        for password, status in [('Old!p8Vx2#kL', 401), ('New!q9Zr4#vK', 200)]:
            response = self.client.post(reverse('auth_login'), {'email': self.user.email, 'password': password}, content_type='application/json')
            self.assertEqual(response.status_code, status)
        self.assertEqual(self.client.get('/api/discover/players/').status_code, 403)

    def test_expiration_tampering_malformed_and_purpose(self):
        from datetime import timedelta
        from unittest.mock import patch
        from .password_reset import tokens
        from .email_verification import send_verification
        from django.contrib.auth.tokens import default_token_generator
        now = tokens._now()
        with patch.object(tokens, '_now', return_value=now):
            self.request_link()
        credentials = self.link()
        with patch.object(tokens, '_now', return_value=now + timedelta(seconds=3601)):
            self.assertEqual(self.reset(credentials).status_code, 400)
        for token in (credentials['token'] + 'x', None, {}, default_token_generator.make_token(self.user)):
            self.assertEqual(self.reset(credentials, token=token).status_code, 400)
        for uid in ('!!!', None, {}, 'x' * 101):
            self.assertEqual(self.reset(credentials, uid=uid).status_code, 400)
        send_verification(self.user)
        self.assertEqual(self.reset(credentials, token=self.link()['token']).status_code, 400)
        self.assertEqual(self.client.post(reverse('auth_verify_email'), {'token': credentials['token']}, content_type='application/json').status_code, 400)

    def test_password_policy_and_confirmation_do_not_consume_token(self):
        self.request_link()
        for password in ('short', '123456789', 'password', 'reset@csus.edu'):
            response = self.reset(password=password, confirmPassword=password)
            self.assertEqual(response.status_code, 400)
            self.assertIn('password', response.json()['errors'])
        self.assertIn('confirmPassword', self.reset(confirmPassword='different').json()['errors'])
        self.assertEqual(self.reset().status_code, 200)

    def test_verified_status_preserved_and_changed_email_invalidates(self):
        self.user.isEmailVerified = True
        self.user.save()
        self.request_link()
        self.assertEqual(self.reset().status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.isEmailVerified)
        self.request_link()
        self.user.email = 'changed@csus.edu'
        self.user.save()
        self.assertEqual(self.reset().status_code, 400)

    def test_csrf_and_methods(self):
        from django.test import Client
        secure = Client(enforce_csrf_checks=True)
        for name in ('auth_forgot_password', 'auth_reset_password'):
            self.assertEqual(secure.get(reverse(name)).status_code, 405)
            self.assertEqual(secure.post(reverse(name), {}, content_type='application/json').status_code, 403)
