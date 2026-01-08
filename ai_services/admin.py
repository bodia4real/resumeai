from django.contrib import admin
from .models import AIGeneration


@admin.register(AIGeneration)
class AIGenerationAdmin(admin.ModelAdmin):
    list_display = ['prompt_type', 'user', 'application', 'model_used', 'created_at']
    search_fields = ['user__username', 'prompt_type']
    list_filter = ['prompt_type', 'model_used', 'created_at']
    raw_id_fields = ['application']
