import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { to: '/applications', label: 'Applications', icon: Briefcase, color: 'text-emerald-500' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-500' },
  { to: '/ai-tools', label: 'AI Tools', icon: Sparkles, color: 'text-amber-500' },
  { to: '/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm group-hover:shadow-md transition-shadow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">ResumeAI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 transition-all duration-200',
                        isActive && 'bg-secondary text-foreground shadow-sm'
                      )}
                    >
                      <link.icon className={cn('h-4 w-4', isActive && link.color)} />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user?.username}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className={cn(
                'h-5 w-5 transition-all duration-200',
                mobileMenuOpen && 'rotate-90 opacity-0'
              )} />
              <X className={cn(
                'h-5 w-5 absolute transition-all duration-200',
                mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
              )} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-[280px] bg-background z-50 md:hidden shadow-2xl',
        'transform transition-transform duration-300 ease-out',
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">Logged in</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Drawer Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <link.icon className={cn('h-5 w-5', isActive ? link.color : 'text-muted-foreground group-hover:text-foreground')} />
                    <span className="font-medium">{link.label}</span>
                    <ChevronRight className={cn(
                      'h-4 w-4 ml-auto transition-transform',
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    )} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
