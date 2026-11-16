#when updating please use the following commands:
#1 python manage.py makemigrations accounts
#2 python manage.py migrate

from django.db import models
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
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
