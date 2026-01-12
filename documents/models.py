from django.db import models
from django.contrib.auth.models import User


def document_upload_path(instance, filename):
    """
    Organizes files as: documents/{user_id}/{document_type}/{filename}
    Example: documents/1/resume/Bohdan_Resume.pdf
    """
    return f'documents/{instance.user.id}/{instance.document_type}/{filename}'


class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    application = models.ForeignKey('applications.JobApplication', on_delete=models.CASCADE, null=True, blank=True)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to=document_upload_path)
    file_name = models.CharField(max_length=255)
    is_master = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.document_type})"