import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  Bookmark,
  Send,
  MessageSquare,
  Award
} from 'lucide-react';
import type { Application, ApplicationFormData } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<ApplicationFormData>({
    company_name: '',
    position: '',
    status: 'saved',
    date_saved: today,
    date_applied: '',
    date_interview: '',
    date_offer: '',
    location: '',
    salary_range: '',
    job_url: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (id) {
      const loadApplication = async () => {
        try {
          const app = await api.applicationsAPI.getById(id);
          setFormData({
            company_name: app.company_details?.name || app.company_name || '',
            position: app.position || '',
            status: app.status || 'saved',
            date_saved: app.date_saved || '',
            date_applied: app.date_applied || '',
            date_interview: app.date_interview || '',
            date_offer: app.date_offer || '',
            location: app.location || '',
            salary_range: app.salary_range || '',
            job_url: app.job_url || app.application_url || '',
            notes: app.notes || '',
          });
        } catch (err) {
          setError('Failed to load application');
        } finally {
          setIsLoading(false);
        }
      };

      loadApplication();
    }
  }, [id, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (id) {
        await api.applicationsAPI.update(id, formData);
      } else {
        await api.applicationsAPI.create(formData);
      }
      // Clear job_url after save
      setFormData({ ...formData, job_url: '' });
      navigate('/applications');
    } catch (err: any) {
      const data = err.response?.data;
      const fieldError = data && typeof data === 'object'
        ? Object.values(data).flat().find((msg) => typeof msg === 'string')
        : null;
      setError(
        fieldError ||
        data?.detail ||
        data?.message ||
        'Failed to save application'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await api.applicationsAPI.delete(id);
      navigate('/applications');
    } catch (err: any) {
      setError('Failed to delete application');
    }
  };

  const handleFillWithAI = async () => {
    if (!formData.job_url) {
      setError('Please enter a job URL first');
      return;
    }

    setError('');
    setIsAIFilling(true);

    try {
      const result = await api.aiServicesAPI.scrapeJobDetails(formData.job_url);
      // Append tracking info to notes
      let newNotes = formData.notes || '';
      if (result.tracking_info) {
        newNotes += (newNotes ? '\n\n' : '') + `Tracking info: ${result.tracking_info}`;
      }
      setFormData({
        ...formData,
        company_name: result.company_name || formData.company_name,
        position: result.position || formData.position,
        location: result.location || formData.location,
        salary_range: result.salary_range || formData.salary_range,
        notes: newNotes,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to auto-fill from URL');
    } finally {
      setIsAIFilling(false);
    }
  };

  // Auto-fill dates based on status change
  const handleStatusChange = (newStatus: string) => {
    const updates: Partial<ApplicationFormData> = { status: newStatus };

    // Auto-fill dates when status changes
    if (newStatus === 'applied' && !formData.date_applied) {
      updates.date_applied = today;
    }
    if (newStatus === 'interview' && !formData.date_interview) {
      updates.date_interview = today;
    }
    if (newStatus === 'offer' && !formData.date_offer) {
      updates.date_offer = today;
    }

    setFormData({ ...formData, ...updates });
  };

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="skeleton h-6 w-40 rounded mb-6" />
        <div className="skeleton h-10 w-64 rounded mb-8" />
        <div className="bg-card rounded-xl border p-6 shadow-card space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-10 w-full rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Applications
      </button>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {id ? 'Edit Application' : 'New Application'}
      </h1>
      <p className="text-muted-foreground mb-8">
        {id ? 'Update the details of your job application' : 'Track a new job opportunity'}
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-slide-down">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border p-6 shadow-card">
        {/* Basic Info Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="e.g., Google, Apple"
                required
                disabled={isSaving}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g., Software Engineer"
                required
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                placeholder="e.g., $120k - $150k"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Status & Dates Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Status & Timeline</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Current Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date fields - show based on status */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Date Saved - always show */}
              <div className={cn(
                "space-y-2 p-3 rounded-lg border transition-all",
                formData.status === 'saved' ? 'bg-muted/50 border-primary/20' : 'bg-transparent'
              )}>
                <Label htmlFor="date_saved" className="flex items-center gap-2 text-sm">
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  Date Saved
                </Label>
                <Input
                  id="date_saved"
                  type="date"
                  value={formData.date_saved || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, date_saved: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              {/* Date Applied - show if applied or beyond */}
              <div className={cn(
                "space-y-2 p-3 rounded-lg border transition-all",
                ['applied', 'interview', 'offer', 'rejected'].includes(formData.status)
                  ? 'bg-primary/5 border-primary/20'
                  : 'opacity-50'
              )}>
                <Label htmlFor="date_applied" className="flex items-center gap-2 text-sm">
                  <Send className="h-4 w-4 text-primary" />
                  Date Applied
                </Label>
                <Input
                  id="date_applied"
                  type="date"
                  value={formData.date_applied || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, date_applied: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              {/* Date Interview - show if interview or beyond */}
              <div className={cn(
                "space-y-2 p-3 rounded-lg border transition-all",
                ['interview', 'offer'].includes(formData.status)
                  ? 'bg-warning/5 border-warning/20'
                  : 'opacity-50'
              )}>
                <Label htmlFor="date_interview" className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-warning" />
                  Interview Date
                </Label>
                <Input
                  id="date_interview"
                  type="date"
                  value={formData.date_interview || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, date_interview: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>

              {/* Date Offer - show if offer */}
              <div className={cn(
                "space-y-2 p-3 rounded-lg border transition-all",
                formData.status === 'offer'
                  ? 'bg-success/5 border-success/20'
                  : 'opacity-50'
              )}>
                <Label htmlFor="date_offer" className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-success" />
                  Offer Date
                </Label>
                <Input
                  id="date_offer"
                  type="date"
                  value={formData.date_offer || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, date_offer: e.target.value })
                  }
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job URL Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="job_url">Job URL</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillWithAI}
                  disabled={isSaving || isAIFilling || !formData.job_url}
                  className="gap-2 hover-lift"
                >
                  {isAIFilling ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Filling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Fill with AI
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="job_url"
                type="url"
                placeholder="https://..."
                value={formData.job_url}
                onChange={(e) =>
                  setFormData({ ...formData, job_url: e.target.value })
                }
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Paste a job posting URL and click "Fill with AI" to auto-populate fields
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about this application..."
                disabled={isSaving}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the application.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-3 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/applications')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Application'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
