import { useState } from 'react';
import { Menu, X, Briefcase, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  { label: 'Pipeline', page: 'hr-pipeline' },
  { label: 'Talent Search', page: 'hr-talent' },
];

export function Navbar() {
  const { page, navigate, hrMode, setHrMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (p: string) => {
    navigate(p);
    setMobileOpen(false);
  };

  const links = hrMode ? hrLinks : navLinks;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav(hrMode ? 'hr-dashboard' : 'home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="font-serif text-lg font-semibold">O</span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-serif text-base font-semibold tracking-tight">Ovid Holding</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {hrMode ? 'HR Workspace' : 'Careers Hub'}
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
          <Button
            onClick={() => {
              setHrMode(!hrMode);
              navigate(hrMode ? 'home' : 'hr-dashboard');
            }}
            variant={hrMode ? 'default' : 'outline'}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Briefcase className="mr-1.5 h-3.5 w-3.5" />
            {hrMode ? 'Exit HR' : 'HR Workspace'}
          </Button>

          {!hrMode && (
            <Button
              onClick={() => handleNav('vacancies')}
              size="sm"
              className="hidden bg-accent text-accent-foreground hover:bg-accent/90 md:inline-flex"
            >
              Browse Jobs
            </Button>
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
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
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
                <button
                  onClick={() => {
                    setHrMode(!hrMode);
                    navigate(hrMode ? 'home' : 'hr-dashboard');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  <Briefcase className="h-4 w-4" />
                  {hrMode ? 'Exit HR Workspace' : 'Enter HR Workspace'}
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
