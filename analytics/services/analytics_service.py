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
    
    IMPORTANT: 'saved' applications are EXCLUDED from all counts.
    Only applications with status: applied, interview, offer, rejected are counted.
    
    Returns:
        dict: {
            'total_applications': int (counted statuses only),
            'by_status': {status: count},
            'response_rate': float (percentage),
            'avg_time_to_response': float (days)
        }
    """
    # Only get applications that are counted (exclude 'saved')
    applications = JobApplication.objects.filter(user=user, status__in=COUNTED_STATUSES)
    total = applications.count()
    
    if total == 0:
        return {
            'total_applications': 0,
            'by_status': {},
            'response_rate': 0.0,
            'avg_time_to_response': 0.0
        }
    
    # Count by status (only counted statuses)
    status_counts = applications.values('status').annotate(count=Count('status'))
    by_status = {item['status']: item['count'] for item in status_counts}
    
    # Calculate response rate (interview + offer + rejected) / total counted
    responded_count = len([s for s in RESPONSE_STATUSES if s in by_status]) 
    responded_count = sum(by_status.get(s, 0) for s in RESPONSE_STATUSES)
    response_rate = (responded_count / total * 100) if total > 0 else 0.0
    
    # Calculate average time to response (only for applications with a response)
    responded_apps = applications.filter(
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
        'by_status': by_status,
        'response_rate': round(response_rate, 2),
        'avg_time_to_response': round(avg_time, 1)
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
        dict: {'dates': [...], 'counts': [...]}
    """
    applications = JobApplication.objects.filter(user=user).order_by('created_at')
    
    if not applications.exists():
        return {'dates': [], 'counts': []}
    
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
    
    return {
        'dates': [str(d) for d in timeline['date'].tolist()],
        'counts': timeline['cumulative'].tolist()
    }


def get_top_companies(user, limit=10):
    """
    Get top companies by application count.
    
    Returns:
        list: [{'company': str, 'count': int}]
    """
    applications = JobApplication.objects.filter(user=user)
    company_counts = applications.values('company__name').annotate(count=Count('id')).order_by('-count')[:limit]
    
    return [
        {'company': item['company__name'], 'count': item['count']}
        for item in company_counts
    ]
