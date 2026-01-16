import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, MapPin, DollarSign, ExternalLink, Briefcase, Calendar, Filter, LayoutGrid, List } from 'lucide-react';
import type { Application } from '@/lib/api';

type StatusFilter = 'all' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
type ViewMode = 'grid' | 'list';

// Skeleton for loading state
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        </div>
        <div className="skeleton h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadApplications = async () => {
      try {
        const data = await api.applicationsAPI.getAll();
        setApplications(data);
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [isLoggedIn]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApps(applications);
    } else {
      setFilteredApps(applications.filter((app) => app.status === statusFilter));
    }
  }, [applications, statusFilter]);

  // Status counts for filter badges
  const statusCounts = {
    all: applications.length,
    saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">
            {applications.length} total application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/applications/new">
          <Button className="gap-2 shadow-sm hover-lift">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="saved">Saved ({statusCounts.saved})</SelectItem>
              <SelectItem value="applied">Applied ({statusCounts.applied})</SelectItem>
              <SelectItem value="interview">Interview ({statusCounts.interview})</SelectItem>
              <SelectItem value="offer">Offer ({statusCounts.offer})</SelectItem>
              <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Applications */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-3'}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">
            {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Start tracking your job applications to see them here'
              : 'Try changing the filter to see other applications'}
          </p>
          <Link to="/applications/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Application
            </Button>
          </Link>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid md:grid-cols-2 gap-4'
            : 'space-y-3'
        }>
          {filteredApps.map((app, index) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}/edit`}
              className={`
                group rounded-xl border bg-card shadow-card card-interactive
                animate-stagger-fade-up
                ${viewMode === 'grid' ? 'p-6' : 'p-4'}
              `}
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
            >
              <div className={`flex items-start justify-between gap-4 ${viewMode === 'list' ? 'flex-row' : ''}`}>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold group-hover:text-primary transition-colors truncate ${viewMode === 'grid' ? 'text-lg' : 'text-base'}`}>
                    {app.position}
                  </h3>
                  <p className="text-muted-foreground truncate">{app.company_name}</p>

                  <div className={`flex flex-wrap items-center gap-3 ${viewMode === 'grid' ? 'mt-4' : 'mt-2'}`}>
                    <StatusBadge status={app.status as any} />

                    {app.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{app.location}</span>
                      </div>
                    )}

                    {app.salary_range && viewMode === 'grid' && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{app.salary_range}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{app.date_applied ? new Date(app.date_applied).toLocaleDateString() : 'No date'}</span>
                    </div>
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
