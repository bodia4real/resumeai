import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { Briefcase, Plus, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import type { Application } from '@/lib/api';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/applications/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
          <Link to="/ai-tools">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Applications"
          value={kpis?.total_applications || 0}
          icon={Briefcase}
        />
        <KPICard
          title="Response Rate"
          value={`${Math.round(((kpis?.interviews || 0) / (kpis?.total_applications || 1)) * 100)}%`}
          icon={Briefcase}
        />
        <KPICard
          title="Avg Days to Response"
          value={kpis?.avg_days_to_response?.toFixed(1) || '0'}
          icon={Briefcase}
        />
        <KPICard
          title="Saved Jobs"
          value={kpis?.saved_applications || 0}
          icon={Briefcase}
        />
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">Recent Applications</h2>
        </div>
        
        {recentApps.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <Link to="/applications/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Application
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentApps.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}/edit`}
                className="block p-6 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{app.position}</h3>
                    <p className="text-muted-foreground">{app.company_name}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge status={app.status as any} />
                      <span className="text-sm text-muted-foreground">
                        Applied: {new Date(app.date_applied).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
