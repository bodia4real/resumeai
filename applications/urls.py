from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, JobApplicationViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'applications', JobApplicationViewSet, basename='application')

urlpatterns = router.urls
