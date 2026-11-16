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
