from django.contrib import admin

# Register your models here.
from .models import FriendRequest


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'status', 'created_at')
    list_filter = ('status',)
