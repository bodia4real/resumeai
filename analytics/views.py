from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services.analytics_service import (
    get_application_stats,
    get_status_distribution,
    get_timeline_data,
    get_top_companies
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_overview_view(request):
    try:
        stats = get_application_stats(request.user)
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': f'Error fetching analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_charts_view(request):
    try:
        timeline = get_timeline_data(request.user)
        top_companies = get_top_companies(request.user, limit=10)
        
        return Response({
            'applications_by_date': timeline,
            'top_companies': top_companies
        })
    except Exception as e:
        return Response(
            {'error': f'Error fetching chart data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
