import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { KPICard } from '@/components/KPICard';
import { Briefcase, BarChart3, TrendingUp, Target, Clock, Award, Building2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import type { AnalyticsOverview, ChartsData } from '@/lib/api';

// Skeleton components
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

function SkeletonChart() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="skeleton h-6 w-40 rounded mb-6" />
      <div className="skeleton h-[300px] w-full rounded" />
    </div>
  );
}

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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="skeleton h-10 w-48 rounded mb-2" />
          <div className="skeleton h-5 w-64 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!overview || !charts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No analytics data available</h2>
        <p className="text-muted-foreground">Start adding applications to see your analytics</p>
      </div>
    );
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

  const statusLabels: Record<string, string> = {
    saved: 'Saved',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
  };

  const statusGradients: Record<string, string> = {
    saved: 'from-slate-500 to-slate-600',
    applied: 'from-blue-500 to-blue-600',
    interview: 'from-amber-500 to-amber-600',
    offer: 'from-emerald-500 to-emerald-600',
    rejected: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your job search progress and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-stagger-fade-up stagger-1">
          <KPICard
            title="Total Applications"
            value={overview.total_applications || 0}
            icon={Briefcase}
            className="h-full"
          />
        </div>
        <div className="animate-stagger-fade-up stagger-2">
          <KPICard
            title="Response Rate"
            value={`${Math.round(((overview.interviews || 0) / (overview.total_applications || 1)) * 100)}%`}
            icon={TrendingUp}
            className="h-full"
          />
        </div>
        <div className="animate-stagger-fade-up stagger-3">
          <KPICard
            title="Avg Days to Response"
            value={overview.avg_days_to_response?.toFixed(1) || '0'}
            icon={Clock}
            className="h-full"
          />
        </div>
        <div className="animate-stagger-fade-up stagger-4">
          <KPICard
            title="Offers"
            value={overview.offers || 0}
            icon={Award}
            className="h-full"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-stagger-fade-up stagger-5">
          <h2 className="text-lg font-semibold mb-6">Status Distribution</h2>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count], index) => {
              const percentage = Math.round((count / total) * 100);
              return (
                <div
                  key={status}
                  className="space-y-2 animate-stagger-fade-up"
                  style={{ animationDelay: `${(index + 5) * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{statusLabels[status]}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} <span className="text-xs">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${statusGradients[status]} transition-all duration-700 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Companies */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-stagger-fade-up stagger-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Top Companies</h2>
          </div>
          {charts.top_companies && charts.top_companies.length > 0 ? (
            <div className="space-y-3">
              {charts.top_companies.slice(0, 6).map((company, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{company.company_name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
                    {company.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No company data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Applications Over Time Chart */}
      <div className="rounded-xl border bg-card p-6 shadow-card animate-stagger-fade-up stagger-7">
        <h2 className="text-lg font-semibold mb-6">Applications Over Time</h2>
        {charts.applications_by_date && charts.applications_by_date.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.applications_by_date} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                allowDecimals={false}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No timeline data available yet</p>
            <p className="text-sm text-muted-foreground">Add more applications to see trends</p>
          </div>
        )}
      </div>
    </div>
  );
}
