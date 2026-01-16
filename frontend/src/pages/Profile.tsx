import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    full_name: '',
    skills: '',
  });

  const [password, setPassword] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username,
        email: user.email,
        full_name: user.full_name || '',
        skills: user.skills || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await api.authAPI.updateProfile({
        full_name: profile.full_name,
        skills: profile.skills,
      });
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (password.new_password !== password.confirm_password) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.authAPI.changePassword({
        old_password: password.old_password,
        new_password: password.new_password,
      });
      setPasswordSuccess('Password changed successfully!');
      setPassword({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Personal Information</h2>
        </div>

        {profileError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{profileError}</AlertDescription>
          </Alert>
        )}

        {profileSuccess && (
          <Alert className="mb-6 border-success bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">{profileSuccess}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              disabled={profileLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Textarea
              id="skills"
              value={profile.skills}
              onChange={(e) =>
                setProfile({ ...profile, skills: e.target.value })
              }
              disabled={profileLoading}
              rows={3}
              placeholder="e.g., React, TypeScript, Node.js, Python"
            />
          </div>

          <Button type="submit" disabled={profileLoading} className="w-full">
            {profileLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Change Password</h2>
        </div>

        {passwordError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        {passwordSuccess && (
          <Alert className="mb-6 border-success bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">{passwordSuccess}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old_password">Current Password</Label>
            <Input
              id="old_password"
              type="password"
              value={password.old_password}
              onChange={(e) =>
                setPassword({ ...password, old_password: e.target.value })
              }
              disabled={passwordLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={password.new_password}
              onChange={(e) =>
                setPassword({ ...password, new_password: e.target.value })
              }
              disabled={passwordLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={password.confirm_password}
              onChange={(e) =>
                setPassword({ ...password, confirm_password: e.target.value })
              }
              disabled={passwordLoading}
            />
          </div>

          <Button type="submit" disabled={passwordLoading} className="w-full">
            {passwordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
