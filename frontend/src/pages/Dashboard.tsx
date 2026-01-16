import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Briefcase,
  Plus,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Clock,
  BookmarkCheck,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import type { Application } from '@/lib/api';

// Skeleton components inline for loading state
function SkeletonKPI() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
        </div>
        <div className="skeleton h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonAppRow() {
  return (
    <div className="p-6 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="flex gap-3 mt-3">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadDashboard = async () => {
      try {
        const [overview, apps] = await Promise.all([
          api.analyticsAPI.getOverview(),
          api.applicationsAPI.getAll(),
        ]);

        setKpis(overview);
        setRecentApps(apps.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [isLoggedIn]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your job search overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/applications/new">
            <Button className="gap-2 shadow-sm hover-lift">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Application</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
          <Link to="/ai-tools">
            <Button variant="outline" className="gap-2 hover-lift">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
              <span className="sm:hidden">AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonKPI />
            <SkeletonKPI />
            <SkeletonKPI />
            <SkeletonKPI />
          </>
        ) : (
          <>
            <div className="animate-stagger-fade-up stagger-1">
              <KPICard
                title="Total Applications"
                value={kpis?.total_applications || 0}
                icon={Briefcase}
                className="h-full"
              />
            </div>
            <div className="animate-stagger-fade-up stagger-2">
              <KPICard
                title="Response Rate"
                value={`${Math.round(((kpis?.interviews || 0) / (kpis?.total_applications || 1)) * 100)}%`}
                icon={TrendingUp}
                className="h-full"
              />
            </div>
            <div className="animate-stagger-fade-up stagger-3">
              <KPICard
                title="Avg Days to Response"
                value={kpis?.avg_days_to_response?.toFixed(1) || '0'}
                icon={Clock}
                className="h-full"
              />
            </div>
            <div className="animate-stagger-fade-up stagger-4">
              <KPICard
                title="Saved Jobs"
                value={kpis?.saved_applications || 0}
                icon={BookmarkCheck}
                className="h-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/applications/new"
          className="group p-5 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 hover-lift"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Add Application</h3>
              <p className="text-sm text-muted-foreground">Track a new job</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/ai-tools"
          className="group p-5 rounded-xl border bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:from-purple-500/10 hover:to-purple-500/20 transition-all duration-300 hover-lift"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Tools</h3>
              <p className="text-sm text-muted-foreground">Resume & cover letter</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/analytics"
          className="group p-5 rounded-xl border bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 hover:from-emerald-500/10 hover:to-emerald-500/20 transition-all duration-300 hover-lift sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Applications</h2>
          {recentApps.length > 0 && (
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div>
            <SkeletonAppRow />
            <SkeletonAppRow />
            <SkeletonAppRow />
          </div>
        ) : recentApps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start tracking your job applications to see them here
            </p>
            <Link to="/applications/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Application
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentApps.map((app, index) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}/edit`}
                className="block p-6 hover:bg-muted/50 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                      {app.position}
                    </h3>
                    <p className="text-muted-foreground truncate">{app.company_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <StatusBadge status={app.status as any} />
                      <span className="text-sm text-muted-foreground">
                        {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
