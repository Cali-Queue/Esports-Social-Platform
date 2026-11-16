#when updating please use the following commands:
#1 python manage.py makemigrations accounts
#2 python manage.py migrate

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Greatest, Least
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


# Create your models here.
class Schools(models.Model):
    school = models.CharField(max_length=100, unique=True)

#Hashes the password and normalizes the email when creating users.
#Use User.objects.create_user(...) instead of User.objects.create(...) so the password isn't saved as plain text.
class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')
        user = self.model(email=self.normalize_email(email).lower(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    email = models.EmailField(max_length=100, unique=True)
    real_name = models.CharField(max_length=200)
    #collected at signup. nullable so accounts made before this column existed still work
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    isEmailVerified = models.BooleanField(default=False)
    dateJoined = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, default='Member')
    #empty at signup, the user picks their school in the first-time setup flow
    school = models.ForeignKey(Schools, on_delete=models.PROTECT, null=True, blank=True)
    USERNAME_FIELD = "email"

    #hooks up create_user() above
    objects = UserManager()

#User Profile table, stores additional information about the user.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile') #links each profile to one user and deletes the profile if the user is deleted
    handle = models.CharField(max_length=30, unique=True)
    gamertag = models.CharField(max_length=50)
    show_real_name = models.BooleanField(default=True)
    pronouns = models.CharField(max_length=30, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    grad_year = models.PositiveSmallIntegerField(null=True, blank=True)
    team = models.ForeignKey('Team', on_delete=models.SET_NULL, null=True, blank=True, related_name='profiles')
    game = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=50, blank=True)
    rank = models.CharField(max_length=50, blank=True)
    looking_for_team = models.BooleanField(default=False)
    interests = models.JSONField(default=list, blank=True)
    avatar = models.CharField(max_length=255, blank=True)
    banner = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#Team table, a team belongs to one school and has many players through TeamMember.
class Team(models.Model):
    name = models.CharField(max_length=100)
    school = models.ForeignKey(Schools, on_delete=models.PROTECT, related_name='teams')
    game = models.CharField(max_length=50, blank=True)
    players = models.ManyToManyField(User, through='TeamMember', related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['school', 'name'], name='unique_team_name_per_school'),
        ]

#Team Member table, links a player to a team with their status, permission, and game role on that team.
class TeamMember(models.Model):
    STATUS_CHOICES = [
        ('starter', 'Starter'),
        ('substitute', 'Substitute'),
        ('reserve', 'Reserve'),
        ('inactive', 'Inactive'),
    ]
    PERMISSION_CHOICES = [
        ('athlete', 'Athlete'),
        ('captain', 'Captain'),
        ('student', 'Student'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='starter')
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='athlete')
    game_role = models.CharField(max_length=50, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['team', 'user'], name='unique_player_per_team'),
        ]

#Friend Request table, one student asking another to be friends.
#A student can't send one to themselves, and only one request can be pending between the same two students
#(in either direction). Both rules are enforced by the database as well as by send().
class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_friend_requests')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_friend_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(condition=~Q(sender=F('recipient')), name='friend_request_not_to_self'),
            models.UniqueConstraint(
                Least('sender', 'recipient'),
                Greatest('sender', 'recipient'),
                condition=Q(status='pending'),
                name='one_pending_friend_request_per_pair',
            ),
        ]

    @classmethod
    def pending_between(cls, a, b):
        return cls.objects.filter(
            Q(sender=a, recipient=b) | Q(sender=b, recipient=a),
            status='pending',
        )

    @classmethod
    def send(cls, sender, recipient):
        if sender.pk == recipient.pk:
            raise ValidationError("You can't send a friend request to yourself.")
        if cls.pending_between(sender, recipient).exists():
            raise ValidationError('A friend request between these students is already pending.')
        return cls.objects.create(sender=sender, recipient=recipient)

    def respond(self, status):
        if self.status != 'pending':
            raise ValidationError('This friend request has already been answered.')
        self.status = status
        self.responded_at = timezone.now()
        self.save(update_fields=['status', 'responded_at'])


class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=64, unique=True)
    email = models.EmailField(max_length=100)
    sent_at = models.DateTimeField()


#Failed Login Attempt table, one row per wrong email/password on the login form.
#Keyed by the email that was typed instead of a User FK, so made-up emails get tracked and locked
#the same way as real ones. Otherwise the lockout itself would reveal which accounts exist.
#The rules that use this table are in login_protection.py.
class FailedLoginAttempt(models.Model):
    email = models.EmailField(max_length=100, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    attempted_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-attempted_at']

#Login Lockout table, one row per email that hit the failed-attempt limit.
#Login is blocked until locked_until, even with the right password.
class LoginLockout(models.Model):
    email = models.EmailField(max_length=100, unique=True)
    locked_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
