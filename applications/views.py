from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Company, JobApplication
from .serializers import CompanySerializer, JobApplicationSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company CRUD operations.
    GET /api/companies/ - List all companies
    POST /api/companies/ - Create new company
    GET /api/companies/{id}/ - Get company details
    PUT /api/companies/{id}/ - Update company
    DELETE /api/companies/{id}/ - Delete company
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Job Application CRUD operations.
    GET /api/applications/ - List user's applications (filter by ?status=applied)
    POST /api/applications/ - Create new application
    GET /api/applications/{id}/ - Get application details
    PUT /api/applications/{id}/ - Update application
    DELETE /api/applications/{id}/ - Delete application
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users only see their own applications
        queryset = JobApplication.objects.filter(user=self.request.user)
        
        # Filter by status if provided: ?status=applied
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by company if provided: ?company=1
        company = self.request.query_params.get('company')
        if company:
            queryset = queryset.filter(company_id=company)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        # Automatically set the user to the logged-in user
        serializer.save(user=self.request.user)
