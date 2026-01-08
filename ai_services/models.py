from django.db import models
from django.contrib.auth.models import User


class AIGeneration(models.Model):
    PROMPT_TYPE_CHOICES = [
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
        ('skills', 'Skills'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    application = models.ForeignKey('applications.JobApplication', on_delete=models.CASCADE)
    prompt_type = models.CharField(max_length=20, choices=PROMPT_TYPE_CHOICES)
    input_text = models.TextField()
    output_text = models.TextField()
    model_used = models.CharField(max_length=100, default='gpt-4')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prompt_type} for {self.application}"