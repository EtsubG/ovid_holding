
import { useEffect, type ReactNode } from 'react';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { useApp } from '@/lib/app-context';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Only these roles can access. If omitted, any authenticated user can access. */
  allow?: UserRole[];
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const { navigate } = useApp();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login
      navigate('login');
      return;
    }

    if (!loading && isAuthenticated && allow && user && !allow.includes(user.role)) {
      // Not authorized — bounce to home
      navigate('home');
    }
  }, [loading, isAuthenticated, allow, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (allow && user && !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="font-serif text-2xl font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to view this page. Your role is{' '}
            <strong className="text-foreground">{user.role}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}