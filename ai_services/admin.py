from django.contrib import admin
from .models import AIGeneration


@admin.register(AIGeneration)
class AIGenerationAdmin(admin.ModelAdmin):
    list_display = ['generation_type', 'user', 'application', 'model_used', 'tokens_used', 'created_at']
    search_fields = ['user__username', 'generation_type', 'job_description']
    list_filter = ['generation_type', 'model_used', 'created_at']
    raw_id_fields = ['application', 'user']
    readonly_fields = ['created_at', 'tokens_used']
    
    fieldsets = (
        ('Generation Info', {
            'fields': ('user', 'application', 'generation_type')
        }),
        ('Input', {
            'fields': ('input_resume', 'job_description', 'job_url')
        }),
        ('Output', {
            'fields': ('output_text', 'model_used', 'tokens_used')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
