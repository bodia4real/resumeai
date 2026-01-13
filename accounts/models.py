from django.db import models
from django.contrib.auth.models import User
import secrets
from datetime import timedelta
from django.utils import timezone


class UserProfile(models.Model):
    """
    Simple user profile with name and skills.
    Extended User model for additional profile info.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    skills = models.TextField(blank=True, null=True, help_text="Comma-separated list of skills")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile"


class PasswordResetToken(models.Model):
    """
    Simple password reset with email verification code.
    Code expires after 30 minutes.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    code = models.CharField(max_length=6)  # 6-digit code
    email = models.EmailField()  # Email the code was sent to
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        """Check if code is still valid (not expired and not used)"""
        expires_at = self.created_at + timedelta(minutes=30)
        return not self.is_used and timezone.now() < expires_at
    
    @staticmethod
    def generate_code():
        """Generate a random 6-digit code"""
        return str(secrets.randbelow(1000000)).zfill(6)
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
