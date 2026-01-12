from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'user_id', 'application', 'document_type', 'file', 
                  'file_name', 'is_master', 'file_url', 'created_at']
        read_only_fields = ['user_id', 'file_name', 'created_at', 'file_url']
    
    def get_file_url(self, obj):
        """Return the full URL to the file"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def create(self, validated_data):
        # Set the user to the logged-in user
        validated_data['user'] = self.context['request'].user
        # Extract filename from file
        validated_data['file_name'] = validated_data['file'].name
        return super().create(validated_data)