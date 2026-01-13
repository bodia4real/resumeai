from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    LogoutView,
    profile_view,
    change_password_view,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', profile_view, name='profile'),
    path('change-password/', change_password_view, name='change-password'),
]

