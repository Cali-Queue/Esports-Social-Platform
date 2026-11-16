#auth API routes. mounted at /api/auth/ in config/urls.py, so these become
#/api/auth/csrf/, /api/auth/signup/, etc.
#(kept separate from urls.py, which holds the Discover routes)
from django.urls import path
from . import auth_views as views

urlpatterns = [
    path('csrf/', views.csrf, name='auth_csrf'),        # GET  sets the CSRF cookie
    path('signup/', views.signup, name='auth_signup'),  # POST create account + log in
    path('login/', views.login_view, name='auth_login'),  # POST log in
    path('logout/', views.logout_view, name='auth_logout'),  # POST log out
    path('me/', views.me, name='auth_me'),              # GET  current user
]
