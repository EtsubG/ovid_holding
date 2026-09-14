// frontend/src/components/Navbar.tsx
import { useState } from 'react';
import { Menu, Briefcase, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Companies', page: 'companies' },
  { label: 'Vacancies', page: 'vacancies' },
  { label: 'Talent Pool', page: 'talent-pool' },
  { label: 'About Ovid', page: 'about' },
  { label: 'FAQs', page: 'faqs' },
  { label: 'Contact', page: 'contact' },
];

const hrLinks = [
  { label: 'Dashboard', page: 'hr-dashboard' },
  { label: 'Vacancies', page: 'hr-vacancies' },
  { label: 'Approvals', page: 'hr-approvals' },   // 🆕
  { label: 'Pipeline', page: 'hr-pipeline' },
  { label: 'Talent Search', page: 'hr-talent' },
];

export function Navbar() {
  const { page, navigate, hrMode, setHrMode } = useApp();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (p: string) => {
    navigate(p);
    setMobileOpen(false);
  };

  const handleEnterHR = () => {
    if (!isAuthenticated) {
      handleNav('login');
    } else {
      setHrMode(true);
      handleNav('hr-dashboard');
    }
  };

  const handleExitHR = () => {
    setHrMode(false);
    handleNav('home');
  };

  const handleLogout = () => {
    logout();
    setHrMode(false);
    toast.success('Logged out successfully');
    handleNav('home');
  };

  // Only show HR links if user is authenticated AND hrMode
  const links = hrMode && isAuthenticated ? hrLinks : navLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav(hrMode && isAuthenticated ? 'hr-dashboard' : 'home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="font-serif text-lg font-semibold">O</span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-serif text-base font-semibold tracking-tight">Ovid Holding</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {hrMode && isAuthenticated ? 'HR Workspace' : 'Careers Hub'}
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={cn(
                'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                page === link.page
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
              {page === link.page && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* HR Mode button */}
          {hrMode && isAuthenticated ? (
            <Button
              onClick={handleExitHR}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />
              Exit HR
            </Button>
          ) : (
            <Button
              onClick={handleEnterHR}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />
              HR Workspace
            </Button>
          )}

          {/* Browse Jobs (careers mode only) */}
          {!hrMode && (
            <Button
              onClick={() => handleNav('vacancies')}
              size="sm"
              className="hidden bg-accent text-accent-foreground hover:bg-accent/90 md:inline-flex"
            >
              Browse Jobs
            </Button>
          )}

          {/* User menu (authenticated) */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden gap-2 sm:inline-flex"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.fullName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                      <Shield className="h-2.5 w-2.5" />
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setHrMode(true);
                    navigate('hr-dashboard');
                  }}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  HR Dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => {
                      setHrMode(true);
                      navigate('hr-users');
                    }}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Manage Users
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  {hrMode && isAuthenticated ? 'HR Workspace' : 'Navigation'}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {isAuthenticated && user && (
                  <div className="mb-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                      <Shield className="h-2.5 w-2.5" />
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {links.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={cn(
                      'rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors',
                      page === link.page
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </button>
                ))}

                <div className="my-2 h-px bg-border" />

                {isAuthenticated ? (
                  <>
                    {hrMode ? (
                      <button
                        onClick={() => {
                          handleExitHR();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      >
                        <Briefcase className="h-4 w-4" />
                        Exit HR Workspace
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setHrMode(true);
                          handleNav('hr-dashboard');
                        }}
                        className="flex items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      >
                        <Briefcase className="h-4 w-4" />
                        Enter HR Workspace
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleNav('login')}
                    className="flex items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  >
                    <Briefcase className="h-4 w-4" />
                    HR Login
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}