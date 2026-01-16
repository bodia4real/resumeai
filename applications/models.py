from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    position = models.CharField(max_length=255)
    job_description = models.TextField(blank=True, null=True)
    application_url = models.URLField(blank=True, null=True, max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='saved')
    date_saved = models.DateField(blank=True, null=True, help_text='When the application was first saved')
    date_applied = models.DateField(blank=True, null=True, help_text='When the user actually applied')
    date_interview = models.DateField(blank=True, null=True, help_text='Date of interview')
    date_offer = models.DateField(blank=True, null=True, help_text='Date of offer')
    date_rejected = models.DateField(blank=True, null=True, help_text='Date of rejection')
    date_updated = models.DateTimeField(auto_now=True, help_text='When the application was last updated')
    location = models.CharField(max_length=255, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.position} at {self.company.name}"