from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone

from .models import FailedLoginAttempt, FriendRequest, LoginLockout, Schools, User


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


class LoginProtectionTests(TestCase):
    PASSWORD = 'correct-horse-42'

    def setUp(self):
        self.user = User.objects.create_user(email='kai@csus.edu', password=self.PASSWORD, real_name='Kai')

    def login(self, password, email='kai@csus.edu'):
        return self.client.post('/api/auth/login/', {'email': email, 'password': password}, content_type='application/json')

    def fail(self, times, email='kai@csus.edu'):
        return [self.login('wrong-password', email) for _ in range(times)][-1]

    def test_each_failed_attempt_is_tracked(self):
        self.fail(3)
        self.assertEqual(FailedLoginAttempt.objects.filter(email='kai@csus.edu').count(), 3)

    def test_four_failures_still_allow_login(self):
        self.assertEqual(self.fail(4).status_code, 401)
        self.assertEqual(self.login(self.PASSWORD).status_code, 200)

    def test_fifth_failure_locks_the_account(self):
        response = self.fail(5)
        self.assertEqual(response.status_code, 429)
        self.assertTrue(LoginLockout.objects.filter(email='kai@csus.edu').exists())

    def test_correct_password_is_blocked_during_lockout(self):
        self.fail(5)
        response = self.login(self.PASSWORD)
        self.assertEqual(response.status_code, 429)
        self.assertNotIn('_auth_user_id', self.client.session)  # no session was started

    def test_lockout_message_says_when_to_try_again(self):
        response = self.fail(5)
        data = response.json()
        self.assertIn('Try again in 15 minutes', data['detail'])
        self.assertIn('lockedUntil', data)
        self.assertEqual(response['Retry-After'], str(data['retryAfter']))
        self.assertAlmostEqual(data['retryAfter'], 15 * 60, delta=5)

    def test_blocked_attempts_do_not_extend_the_lockout(self):
        self.fail(5)
        until = LoginLockout.objects.get(email='kai@csus.edu').locked_until
        self.fail(3)
        self.assertEqual(LoginLockout.objects.get(email='kai@csus.edu').locked_until, until)

    def test_can_log_in_after_lockout_expires(self):
        self.fail(5)
        LoginLockout.objects.update(locked_until=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.login(self.PASSWORD).status_code, 200)

    def test_counter_starts_fresh_after_lockout_expires(self):
        self.fail(5)
        LoginLockout.objects.update(locked_until=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.fail(1).status_code, 401)  # one new failure, not locked again

    def test_failures_older_than_15_minutes_do_not_count(self):
        self.fail(4)
        FailedLoginAttempt.objects.update(attempted_at=timezone.now() - timedelta(minutes=16))
        self.assertEqual(self.fail(1).status_code, 401)

    def test_successful_login_clears_the_counter(self):
        self.fail(4)
        self.assertEqual(self.login(self.PASSWORD).status_code, 200)
        self.assertFalse(FailedLoginAttempt.objects.filter(email='kai@csus.edu').exists())
        self.client.logout()
        self.assertEqual(self.fail(4).status_code, 401)  # would be 429 if the old 4 still counted

    def test_wrong_email_and_wrong_password_get_the_same_error(self):
        wrong_password = self.login('wrong-password')
        no_account = self.login('wrong-password', email='nobody@csus.edu')
        self.assertEqual(wrong_password.status_code, no_account.status_code)
        self.assertEqual(wrong_password.json(), no_account.json())
        self.assertEqual(wrong_password.json()['detail'], 'Invalid email or password.')

    def test_unknown_emails_lock_the_same_way(self):
        # otherwise an attacker could tell real accounts apart by which ones lock
        response = self.fail(5, email='nobody@csus.edu')
        self.assertEqual(response.status_code, 429)

    def test_lockout_is_per_email(self):
        User.objects.create_user(email='astra@csus.edu', password=self.PASSWORD, real_name='Astra')
        self.fail(5)
        self.assertEqual(self.login(self.PASSWORD, email='astra@csus.edu').status_code, 200)

    def test_email_case_does_not_bypass_the_lockout(self):
        self.fail(5, email='KAI@csus.edu')
        self.assertEqual(self.login(self.PASSWORD).status_code, 429)
