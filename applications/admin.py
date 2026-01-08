from django.contrib import admin
from .models import Company, JobApplication


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'website', 'created_at']
    search_fields = ['name', 'industry']
    list_filter = ['industry', 'created_at']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'user', 'status', 'date_applied', 'created_at']
    search_fields = ['position', 'company__name', 'user__username']
    list_filter = ['status', 'date_applied', 'created_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['company']
