import os
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


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

    def delete(self, *args, **kwargs):
        """
        Ensure the file is removed from storage when the model is deleted.
        Also remove empty directories up to MEDIA_ROOT/documents.
        """
        # Capture file path and containing directory before deletion
        file_path = None
        file_dir = None
        try:
            if self.file:
                file_path = self.file.path
                file_dir = os.path.dirname(file_path)
        except Exception:
            # If file path can't be resolved (e.g., missing), continue safely
            file_path = None
            file_dir = None

        # Delete the file from storage without saving the model again
        if self.file:
            self.file.delete(save=False)

        # Clean up empty directories up to MEDIA_ROOT/documents
        try:
            documents_root = os.path.join(settings.MEDIA_ROOT, 'documents')

            def is_subpath(path, root):
                try:
                    return os.path.realpath(path).startswith(os.path.realpath(root))
                except Exception:
                    return False

            current_dir = file_dir
            while current_dir and is_subpath(current_dir, documents_root) and os.path.normpath(current_dir) != os.path.normpath(documents_root):
                try:
                    if os.path.isdir(current_dir) and not os.listdir(current_dir):
                        os.rmdir(current_dir)
                        current_dir = os.path.dirname(current_dir)
                    else:
                        break
                except Exception:
                    break
            # Finally, remove 'documents' folder itself if empty
            try:
                if os.path.isdir(documents_root) and not os.listdir(documents_root):
                    os.rmdir(documents_root)
            except Exception:
                pass
        except Exception:
            pass

        # Proceed with the actual model deletion
        super().delete(*args, **kwargs)