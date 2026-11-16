from django.contrib import admin

# Register your models here.
from .models import FailedLoginAttempt, FriendRequest, LoginLockout


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(FailedLoginAttempt)
class FailedLoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'ip_address', 'attempted_at')
    search_fields = ('email',)


#deleting a row here unlocks that email early
@admin.register(LoginLockout)
class LoginLockoutAdmin(admin.ModelAdmin):
    list_display = ('email', 'locked_until', 'created_at')
    search_fields = ('email',)
