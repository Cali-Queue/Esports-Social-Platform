#when updating please use the following commands:
#1 python manage.py makemigrations accounts
#2 python manage.py migrate

from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone


# Create your models here.
class Schools(models.Model):
    school = models.CharField(max_length=100, unique=True)

class User(AbstractBaseUser):
    email = models.EmailField(max_length=100, unique=True)
    real_name = models.CharField(max_length=200)
    isEmailVerified = models.BooleanField(default=False)
    dateJoined = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, default='Member')
    school = models.ForeignKey(Schools, on_delete=models.PROTECT)
    USERNAME_FIELD = "email"
