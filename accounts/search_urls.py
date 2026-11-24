#search API routes. mounted at /api/search/ in config/urls.py
from django.urls import path
from .search_views import search

urlpatterns = [
    path('', search, name='search'),  # GET ?q=<student or team name>
]
