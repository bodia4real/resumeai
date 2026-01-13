import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { KPICard } from '@/components/KPICard';
import { Briefcase, BarChart3, TrendingUp, Target, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { AnalyticsOverview, ChartsData } from '@/lib/api';

export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadAnalytics = async () => {
      try {
        const [overviewData, chartsData] = await Promise.all([
          api.analyticsAPI.getOverview(),
          api.analyticsAPI.getCharts(),
        ]);

        setOverview(overviewData);
        setCharts(chartsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overview || !charts) {
    return <div>No analytics data available</div>;
  }

  const statusCounts = {
    saved: overview.saved_applications || 0,
    applied: overview.applications_applied || 0,
    interview: overview.interviews || 0,
    offer: overview.offers || 0,
    rejected: overview.rejected || 0,
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  const statusColors: Record<string, string> = {
    saved: 'bg-status-saved',
    applied: 'bg-status-applied',
    interview: 'bg-status-interview',
    offer: 'bg-status-offer',
    rejected: 'bg-status-rejected',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Applications"
          value={overview.total_applications || 0}
          icon={Briefcase}
        />
        <KPICard
          title="Response Rate"
          value={`${Math.round(((overview.interviews || 0) / (overview.total_applications || 1)) * 100)}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Avg Days to Response"
          value={overview.avg_days_to_response?.toFixed(1) || '0'}
          icon={BarChart3}
        />
        <KPICard
          title="Offers"
          value={overview.offers || 0}
          icon={Target}
        />
      </div>

      {/* Status Distribution */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-6">Status Distribution</h2>
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = Math.round((count / total) * 100);
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-medium text-sm">{status}</span>
                  <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[status]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Companies */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-6">Top Companies</h2>
        {charts.top_companies && charts.top_companies.length > 0 ? (
          <div className="space-y-3">
            {charts.top_companies.slice(0, 8).map((company, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{company.company_name}</span>
                <span className="text-sm text-muted-foreground">{company.count} applications</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No company data available</p>
        )}
      </div>

      {/* Applications Over Time (Line Chart) */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-6">Applications Over Time</h2>
        {charts.applications_by_date && charts.applications_by_date.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.applications_by_date} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">No timeline data available</p>
        )}
      </div>
    </div>
  );
}
