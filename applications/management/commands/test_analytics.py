"""
Test Analytics Script

Run with: python manage.py test_analytics

This script:
1. Creates test applications with all 5 statuses
2. Tests that analytics calculations are correct
3. Verifies 'saved' applications are excluded
4. Prints results in a clear format
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from applications.models import Company, JobApplication
from applications.status_manager import get_status_choices, is_counted_status
from analytics.services.analytics_service import (
    get_application_stats,
    get_status_distribution,
    get_timeline_data,
    get_top_companies
)
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Test analytics functionality with sample data'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '='*60)
        self.stdout.write('ANALYTICS TEST SCRIPT')
        self.stdout.write('='*60 + '\n')
        
        # Get or create test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        self.stdout.write(f"✓ Using user: {user.username}")
        
        # Clear old test data
        JobApplication.objects.filter(user=user).delete()
        self.stdout.write("✓ Cleared old test data\n")
        
        # Create test company
        company, _ = Company.objects.get_or_create(
            name='Tech Corp',
            defaults={'industry': 'Technology'}
        )
        self.stdout.write(f"✓ Created test company: {company.name}\n")
        
        # Create test applications
        self.stdout.write('Creating test applications...\n')
        
        test_data = [
            {
                'position': 'Software Engineer (Saved)',
                'status': 'saved',
                'date_applied': None,
                'date_interview': None,
                'date_offer': None,
                'description': '❌ Should NOT count in analytics'
            },
            {
                'position': 'Product Manager (Applied - No Response)',
                'status': 'applied',
                'date_applied': date.today() - timedelta(days=15),
                'date_interview': None,
                'date_offer': None,
                'description': '⏳ Waiting for response (15 days ago)'
            },
            {
                'position': 'Data Scientist (Interview - 5 days)',
                'status': 'interview',
                'date_applied': date.today() - timedelta(days=5),
                'date_interview': date.today(),
                'date_offer': None,
                'description': '✓ Got interview response (5 days after applying)'
            },
            {
                'position': 'DevOps Engineer (Offer - 7 days)',
                'status': 'offer',
                'date_applied': date.today() - timedelta(days=7),
                'date_interview': None,
                'date_offer': date.today(),
                'description': '✓ Got offer (7 days after applying)'
            },
            {
                'position': 'Backend Developer (Rejected - 3 days)',
                'status': 'rejected',
                'date_applied': date.today() - timedelta(days=3),
                'date_interview': None,
                'date_offer': None,
                'description': '✗ Rejected (3 days after applying)'
            },
        ]
        
        apps = []
        for data in test_data:
            app = JobApplication.objects.create(
                user=user,
                company=company,
                position=data['position'],
                status=data['status'],
                date_applied=data['date_applied'],
                date_interview=data['date_interview'],
                date_offer=data['date_offer'],
            )
            apps.append(app)
            self.stdout.write(f"  • {data['position']}")
            self.stdout.write(f"    Status: {data['status']}")
            self.stdout.write(f"    {data['description']}\n")
        
        # Test analytics
        self.stdout.write('\n' + '='*60)
        self.stdout.write('ANALYTICS RESULTS')
        self.stdout.write('='*60 + '\n')
        
        stats = get_application_stats(user)
        
        self.stdout.write('📊 OVERVIEW STATS:')
        self.stdout.write(f"  Total Applications: {stats['total_applications']}")
        self.stdout.write(f"  (Note: 'Saved' is excluded, so 5 total - 1 saved = 4)\n")
        
        self.stdout.write('Status Breakdown:')
        for status, count in stats['by_status'].items():
            self.stdout.write(f"  • {status.capitalize()}: {count}")
        
        self.stdout.write(f"\n📈 Response Rate: {stats['response_rate']}%")
        self.stdout.write(f"  Calculation: (interview + offer + rejected) / total counted")
        self.stdout.write(f"  = (1 + 1 + 1) / 4 = 3/4 = 75%\n")
        
        self.stdout.write(f"⏱️  Avg Time to Response: {stats['avg_time_to_response']} days")
        self.stdout.write(f"  Calculation: (5 + 7 + 3) / 3 = 15/3 = 5 days")
        self.stdout.write(f"  (Only counts interview/offer/rejected, not applied)\n")
        
        # Charts data
        status_dist = get_status_distribution(user)
        timeline = get_timeline_data(user)
        top_companies = get_top_companies(user)
        
        self.stdout.write('='*60)
        self.stdout.write('CHARTS DATA')
        self.stdout.write('='*60 + '\n')
        
        self.stdout.write('📊 Status Distribution:')
        for label, count in zip(status_dist['labels'], status_dist['data']):
            self.stdout.write(f"  • {label}: {count}")
        
        self.stdout.write(f"\n📈 Timeline Points: {len(timeline['dates'])} dates")
        self.stdout.write(f"  Dates range: {timeline['dates'][0] if timeline['dates'] else 'N/A'} to {timeline['dates'][-1] if timeline['dates'] else 'N/A'}")
        
        self.stdout.write(f"\n🏢 Top Companies:")
        for company_data in top_companies:
            self.stdout.write(f"  • {company_data['company']}: {company_data['count']} applications")
        
        # Verification
        self.stdout.write('\n' + '='*60)
        self.stdout.write('✅ VERIFICATION')
        self.stdout.write('='*60 + '\n')
        
        checks = [
            (stats['total_applications'] == 4, 
             f"Total applications = 4 (saved excluded): {stats['total_applications']}"),
            (stats['response_rate'] == 75.0, 
             f"Response rate = 75%: {stats['response_rate']}%"),
            (stats['avg_time_to_response'] == 5.0, 
             f"Avg time = 5 days: {stats['avg_time_to_response']} days"),
            (len(stats['by_status']) == 4, 
             f"Status breakdown has 4 items (saved excluded): {len(stats['by_status'])}"),
        ]
        
        all_passed = True
        for passed, message in checks:
            status = "✓ PASS" if passed else "✗ FAIL"
            self.stdout.write(f"{status}: {message}")
            if not passed:
                all_passed = False
        
        self.stdout.write('\n' + '='*60)
        if all_passed:
            self.stdout.write('✅ ALL TESTS PASSED!')
        else:
            self.stdout.write('❌ SOME TESTS FAILED - Check the output above')
        self.stdout.write('='*60 + '\n')
