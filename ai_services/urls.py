from django.urls import path
from . import views

urlpatterns = [
    # AI Generation endpoints
    path('tailor-resume/', views.tailor_resume_direct_view, name='tailor-resume'),
    path('generate-cover-letter/', views.generate_cover_letter_view, name='generate-cover-letter'),
    path('generate-interview-prep/', views.generate_interview_prep_view, name='generate-interview-prep'),
    path('match-score/', views.match_score_view, name='match-score'),
    
    # Job scraping endpoint
    path('scrape-job/', views.scrape_job_url_view, name='scrape-job'),
    
    # Generation history
    path('generations/', views.list_generations_view, name='list-generations'),
    path('generations/<int:pk>/', views.generation_detail_view, name='generation-detail'),
]
