from rest_framework import serializers
from .models import Company, JobApplication

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['created_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)
    company_details = CompanySerializer(source='company', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = ['id', 'company_name', 'company_details', 'position', 'job_description', 
                  'application_url', 'status', 'date_saved', 'date_applied', 'date_interview', 
                  'date_offer', 'salary_range', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'company_details']
    
    def create(self, validated_data):
        # Extract company_name from input
        company_name = validated_data.pop('company_name')
        
        # Get or create company
        company, created = Company.objects.get_or_create(
            name__iexact=company_name,  # Case-insensitive lookup
            defaults={'name': company_name}
        )
        
        # Create application with the company
        application = JobApplication.objects.create(
            company=company,
            **validated_data
        )
        
        return application
    
    def update(self, instance, validated_data):
        # If company_name is provided, update the company
        if 'company_name' in validated_data:
            company_name = validated_data.pop('company_name')
            company, created = Company.objects.get_or_create(
                name__iexact=company_name,
                defaults={'name': company_name}
            )
            instance.company = company
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
