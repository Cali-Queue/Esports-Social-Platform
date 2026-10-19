from django.urls import path
from . import views

urlpatterns = [
    path('', views.explore_map, name='explore_map'),
]