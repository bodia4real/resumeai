from django.contrib import admin
from .models import UserProfile, PasswordResetToken


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'created_at', 'updated_at']
    search_fields = ['user__username', 'full_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'code', 'is_used', 'created_at']
    search_fields = ['user__username', 'email']
    list_filter = ['is_used', 'created_at']
    readonly_fields = ['code', 'created_at']

