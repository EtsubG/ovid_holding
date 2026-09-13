// frontend/src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function Login() {
  const { navigate, setHrMode } = useApp();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setHrMode(true);
      navigate('hr-dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, setHrMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      setHrMode(true);
      toast.success('Welcome back!');
      navigate('hr-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85">
      <div className="absolute inset-0 bg-grain opacity-30" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 text-primary-foreground transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="font-serif text-lg font-semibold">O</span>
          </div>
          <span className="font-serif text-lg font-semibold">Ovid Holding</span>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('home')}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          ← Back to Careers
        </Button>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Badge className="mb-4 bg-accent/15 text-accent-foreground border border-accent/30">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> HR Workspace
            </Badge>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary-foreground">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/60">
              Access the recruitment dashboard
            </p>
          </div>

          <Card className="border-border/40 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@ovidholding.com"
                    className="h-11 pl-10"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || !email || !password}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-primary-foreground/50">
            Need help? Contact{' '}
            <a href="mailto:it@ovidholding.com" className="text-accent hover:underline">
              it@ovidholding.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}