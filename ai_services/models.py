from django.db import models
from django.contrib.auth.models import User


class AIGeneration(models.Model):
    """
    Stores AI-generated content (tailored resumes, cover letters, etc.)
    Tracks what was generated, when, and for which application.
    """
    GENERATION_TYPE_CHOICES = [
        ('tailored_resume', 'Tailored Resume'),
        ('cover_letter', 'Cover Letter'),
        ('interview_prep', 'Interview Preparation'),
            ('skills_analysis', 'Skills Analysis'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_generations')
    application = models.ForeignKey('applications.JobApplication', on_delete=models.CASCADE, null=True, blank=True, related_name='ai_generations')
    generation_type = models.CharField(max_length=20, choices=GENERATION_TYPE_CHOICES)
    
    # Inputs
    input_resume = models.TextField(blank=True, null=True, help_text="Original resume text")
    job_description = models.TextField(help_text="Job description used for generation")
    job_url = models.URLField(blank=True, null=True, help_text="Original job posting URL if scraped")
    
    # Output
    output_text = models.TextField(help_text="AI-generated content")
    
    # Metadata
    model_used = models.CharField(max_length=100, default='gpt-4.1-nano', help_text="OpenAI model used")
    tokens_used = models.IntegerField(null=True, blank=True, help_text="Total tokens consumed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['application']),
        ]

    def __str__(self):
        app_name = f" for {self.application}" if self.application else ""
        return f"{self.get_generation_type_display()}{app_name} - {self.created_at.strftime('%Y-%m-%d')}"