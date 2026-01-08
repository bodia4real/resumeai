from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'document_type', 'user', 'is_master', 'created_at']
    search_fields = ['file_name', 'user__username']
    list_filter = ['document_type', 'is_master', 'created_at']
    raw_id_fields = ['application']
