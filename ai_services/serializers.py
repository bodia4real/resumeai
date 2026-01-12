from rest_framework import serializers
from .models import AIGeneration


class AIGenerationSerializer(serializers.ModelSerializer):
    """
    Serializer for AI-generated content.
    Returns generation history and output to users.
    """
    user_id = serializers.IntegerField(read_only=True)
    generation_type_display = serializers.CharField(source='get_generation_type_display', read_only=True)
    
    class Meta:
        model = AIGeneration
        fields = [
            'id',
            'user_id',
            'application',
            'generation_type',
            'generation_type_display',
            'input_resume',
            'job_description',
            'job_url',
            'output_text',
            'model_used',
            'tokens_used',
            'created_at'
        ]
        read_only_fields = ['user_id', 'created_at', 'tokens_used', 'model_used']


class TailorResumeRequestSerializer(serializers.Serializer):
    """
    Request serializer for tailoring a resume.
    Accepts either job_description text or job_url.
    """
    document_id = serializers.IntegerField(help_text="ID of the resume document to tailor")
    job_description = serializers.CharField(required=False, allow_blank=True, help_text="Job description text")
    job_url = serializers.URLField(required=False, allow_blank=True, help_text="URL to scrape job description from")
    application_id = serializers.IntegerField(required=False, allow_null=True, help_text="Link to job application (optional)")
    
    def validate(self, data):
        """Ensure either job_description or job_url is provided"""
        if not data.get('job_description') and not data.get('job_url'):
            raise serializers.ValidationError("Either 'job_description' or 'job_url' must be provided")
        return data
