"""
Analytics Service

Provides data analysis functions for job applications using Pandas.

NOTE: 'saved' applications are EXCLUDED from all metrics.
Only applications with status 'applied', 'interview', 'offer', 'rejected' count.
"""
import pandas as pd
from django.db.models import Count, Q
from applications.models import JobApplication, Company
from applications.status_manager import COUNTED_STATUSES, RESPONSE_STATUSES


def get_application_stats(user):
    """
    Get overall application statistics for a user.
    
    Returns statistics including all application statuses.
    
    Returns:
        dict: {
            'total_applications': int (all applications including saved),
            'saved_applications': int,
            'applications_applied': int,
            'interviews': int,
            'offers': int,
            'rejected': int,
            'response_rate': float (percentage),
            'avg_days_to_response': float (days)
        }
    """
    # Get all applications
    all_applications = JobApplication.objects.filter(user=user)
    total = all_applications.count()
    
    # Count by status
    status_counts = all_applications.values('status').annotate(count=Count('status'))
    by_status = {item['status']: item['count'] for item in status_counts}
    
    # Extract individual counts
    saved_count = by_status.get('saved', 0)
    applied_count = by_status.get('applied', 0)
    interview_count = by_status.get('interview', 0)
    offer_count = by_status.get('offer', 0)
    rejected_count = by_status.get('rejected', 0)
    
    if total == 0:
        return {
            'total_applications': 0,
            'saved_applications': 0,
            'applications_applied': 0,
            'interviews': 0,
            'offers': 0,
            'rejected': 0,
            'response_rate': 0.0,
            'avg_days_to_response': 0.0
        }
    
    # Calculate response rate (interview + offer + rejected) / total (excluding saved)
    counted_total = applied_count + interview_count + offer_count + rejected_count
    responded_count = interview_count + offer_count + rejected_count
    response_rate = (responded_count / counted_total * 100) if counted_total > 0 else 0.0
    
    # Calculate average time to response (only for applications with a response)
    responded_apps = all_applications.filter(
        status__in=RESPONSE_STATUSES
    ).exclude(date_applied__isnull=True)
    
    time_diffs = []
    for app in responded_apps:
        response_date = app.date_interview or app.date_offer or app.updated_at.date()
        if app.date_applied and response_date:
            time_diffs.append((response_date - app.date_applied).days)
    
    avg_time = sum(time_diffs) / len(time_diffs) if time_diffs else 0.0
    
    return {
        'total_applications': total,
        'saved_applications': saved_count,
        'applications_applied': applied_count,
        'interviews': interview_count,
        'offers': offer_count,
        'rejected': rejected_count,
        'response_rate': round(response_rate, 2),
        'avg_days_to_response': round(avg_time, 1)
    }


def get_status_distribution(user):
    """
    Get distribution of applications by status.
    
    Returns:
        dict: {'labels': [...], 'data': [...]}
    """
    applications = JobApplication.objects.filter(user=user)
    status_counts = applications.values('status').annotate(count=Count('status'))
    
    labels = []
    data = []
    for item in status_counts:
        # Get display name
        status_display = dict(JobApplication.STATUS_CHOICES).get(item['status'], item['status'])
        labels.append(status_display)
        data.append(item['count'])
    
    return {
        'labels': labels,
        'data': data
    }


def get_timeline_data(user):
    """
    Get timeline of applications over time.
    
    Returns:
        list: [{'date': str, 'count': int}]
    """
    applications = JobApplication.objects.filter(user=user).order_by('created_at')
    
    if not applications.exists():
        return []
    
    # Convert to DataFrame
    df = pd.DataFrame(list(applications.values('created_at')))
    df['date'] = pd.to_datetime(df['created_at']).dt.date
    
    # Count applications per day
    timeline = df.groupby('date').size().reset_index(name='count')
    
    # Fill in missing dates with 0
    date_range = pd.date_range(start=timeline['date'].min(), end=timeline['date'].max(), freq='D')
    timeline = timeline.set_index('date').reindex(date_range.date, fill_value=0).reset_index()
    timeline.columns = ['date', 'count']
    
    # Convert to cumulative count
    timeline['cumulative'] = timeline['count'].cumsum()
    
    return [
        {'date': str(d), 'count': int(c)}
        for d, c in zip(timeline['date'].tolist(), timeline['cumulative'].tolist())
    ]


def get_top_companies(user, limit=10):
    """
    Get top companies by application count.
    
    Returns:
        list: [{'company_name': str, 'count': int}]
    """
    applications = JobApplication.objects.filter(user=user)
    company_counts = applications.values('company__name').annotate(count=Count('id')).order_by('-count')[:limit]
    
    return [
        {'company_name': item['company__name'] or 'Unknown', 'count': item['count']}
        for item in company_counts
    ]
