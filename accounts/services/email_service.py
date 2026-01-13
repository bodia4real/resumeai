"""
Email Service

Simple email sending for password reset codes.
Uses Django's email backend (configured in settings).
"""

from django.core.mail import send_mail
from django.conf import settings


def send_password_reset_email(email, code, username):
    """
    Send password reset code to user's email.
    
    Args:
        email (str): User's email address
        code (str): 6-digit reset code
        username (str): User's username
    
    Returns:
        bool: True if email sent successfully
    """
    subject = "ResumeAI - Password Reset Code"
    
    message = f"""
Hi {username},

You requested a password reset for your ResumeAI account.

Your reset code is: {code}

This code expires in 30 minutes.

If you didn't request this, please ignore this email.

ResumeAI Team
"""
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset Code</h2>
            <p>Hi <strong>{username}</strong>,</p>
            <p>You requested a password reset for your ResumeAI account.</p>
            <p style="margin: 20px 0;">
                <strong>Your reset code is:</strong><br>
                <span style="font-size: 24px; font-weight: bold; color: #007bff;">{code}</span>
            </p>
            <p style="color: #666;">This code expires in 30 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </body>
    </html>
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
