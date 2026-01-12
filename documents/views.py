from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializer import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Document CRUD operations with file upload.
    GET /api/documents/ - List user's documents
    POST /api/documents/ - Upload new document (multipart/form-data)
    GET /api/documents/{id}/ - Get document details with download URL
    DELETE /api/documents/{id}/ - Delete document
    
    Supported file types: PDF, DOCX, DOC, TXT
    Max file size: 10MB
    Files are organized by: media/documents/{user_id}/{document_type}/{filename}
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # For file uploads
    
    def get_queryset(self):
        # Users only see their own documents
        return Document.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        # User is already set in serializer.create()
        serializer.save()
