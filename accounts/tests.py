from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import FriendRequest, Schools, User


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
