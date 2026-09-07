import { useState, useMemo } from 'react';
import { Building2, MapPin, Users, Calendar, ArrowRight, Briefcase } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { companies, vacancies, getCompany } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/JobCard';
import { cn } from '@/lib/utils';

export function Companies() {
  const { params, navigate } = useApp();
  const [selectedId, setSelectedId] = useState(params.id || companies[0].id);

  const selected = useMemo(() => getCompany(selectedId), [selectedId]);
  const companyVacancies = useMemo(() => vacancies.filter((v) => v.companyId === selectedId), [selectedId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Our Subsidiaries</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Ovid Group Companies</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Six specialized companies, each a leader in its industry, united by a commitment to excellence.
        </p>
      </div>

      {/* Company selector tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              selectedId === c.id
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground'
            )}
          >
            {c.shortName}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Company detail */}
          <div className="lg:col-span-2">
            <Card className={cn('relative overflow-hidden border-0', 'bg-primary text-primary-foreground')}>
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', selected.accent)} />
              <div className="relative p-8 sm:p-10">
                <Badge className="mb-4 bg-accent/20 text-accent-foreground border border-accent/30">
                  {selected.industry}
                </Badge>
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{selected.name}</h2>
                <p className="mt-2 text-lg text-primary-foreground/70">{selected.tagline}</p>
                <p className="mt-5 max-w-2xl leading-relaxed text-primary-foreground/80">{selected.description}</p>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <div>
                      <div className="text-xs text-primary-foreground/50">Location</div>
                      <div className="text-sm font-medium">{selected.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <div>
                      <div className="text-xs text-primary-foreground/50">Team</div>
                      <div className="text-sm font-medium">{selected.employees}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <div>
                      <div className="text-xs text-primary-foreground/50">Founded</div>
                      <div className="text-sm font-medium">{selected.founded}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Open positions */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold">Open Positions at {selected.name}</h3>
                <Badge variant="secondary" className="font-normal">{companyVacancies.length} roles</Badge>
              </div>
              {companyVacancies.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {companyVacancies.map((v) => (
                    <JobCard key={v.id} vacancy={v} />
                  ))}
                </div>
              ) : (
                <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
                  <Briefcase className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No open positions at the moment.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('talent-pool')}>
                    Join our talent pool <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - all companies */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Companies</h4>
              {companies.map((c) => (
                <Card
                  key={c.id}
                  className={cn(
                    'cursor-pointer border p-4 transition-all',
                    selectedId === c.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border/60 hover:border-accent/30'
                  )}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.industry}</p>
                    </div>
                    <span className="font-serif text-xl font-semibold text-muted-foreground/30">{c.shortName}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
