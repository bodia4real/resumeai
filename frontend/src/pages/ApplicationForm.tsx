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
import { ArrowLeft, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import type { Application, ApplicationFormData } from '@/lib/api';

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [formData, setFormData] = useState<ApplicationFormData>({
    company_name: '',
    position: '',
    status: 'saved',
    date_applied: new Date().toISOString().split('T')[0],
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
            date_applied: app.date_applied || new Date().toISOString().split('T')[0],
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
      setFormData({
        ...formData,
        company_name: result.company_name || formData.company_name,
        position: result.position || formData.position,
        location: result.location || formData.location,
        salary_range: result.salary_range || formData.salary_range,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to auto-fill from URL');
    } finally {
      setIsAIFilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </button>

      <h1 className="text-3xl font-bold mb-8">
        {id ? 'Edit Application' : 'New Application'}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border p-6 shadow-card">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              required
              disabled={isSaving}
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
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as any })
              }
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="date_applied">Date Filed</Label>
            <Input
              id="date_applied"
              type="date"
              value={formData.date_applied}
              onChange={(e) =>
                setFormData({ ...formData, date_applied: e.target.value })
              }
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
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="job_url">Job URL</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillWithAI}
              disabled={isSaving || isAIFilling || !formData.job_url}
              className="gap-2"
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
            disabled={isSaving}
            rows={4}
          />
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
