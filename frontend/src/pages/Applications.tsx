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
import { Plus, MapPin, DollarSign, ExternalLink, Loader2, Briefcase } from 'lucide-react';
import type { Application } from '@/lib/api';

type StatusFilter = 'all' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Link to="/applications/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-card">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No applications found</p>
          <Link to="/applications/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Application
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApps.map((app, index) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}/edit`}
              className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {app.position}
                  </h3>
                  <p className="text-muted-foreground">{app.company_name}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <StatusBadge status={app.status as any} />
                    
                    {app.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {app.location}
                      </div>
                    )}
                    
                    {app.salary_range && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {app.salary_range}
                      </div>
                    )}
                    
                    <span className="text-sm text-muted-foreground">
                      {new Date(app.date_applied).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {app.job_url && (
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 flex-shrink-0"
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
  );
}
