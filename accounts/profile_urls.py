#profile API routes. mounted at /api/profile/ in config/urls.py
from django.urls import path
from . import profile_views as views

urlpatterns = [
    path('me/', views.my_profile, name='my_profile'),  # GET read / PATCH update the logged-in user's profile
]
