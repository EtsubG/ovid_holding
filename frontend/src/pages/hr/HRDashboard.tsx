import { useState, useEffect } from 'react';
import {
  Users, Briefcase, TrendingUp, Clock, ArrowRight, FileText,
  CheckCircle2, Calendar, UserCheck,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { pipelineStages, getCompany, getVacancy, formatDate, type ApplicationStatus } from '@/lib/data';
import * as api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardStats {
  total: number;
  submitted: number;
  underReview: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  hired: number;
  rejected: number;
  pool: number;
  conversionRate: number;
}

export function HRDashboard() {
  const { candidates, navigate, setSelectedCandidateId } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [candidates]);

  const recent = [...candidates]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 6);

  const stageDistribution = pipelineStages.map((s) => ({
    ...s,
    count: candidates.filter((c) => c.status === s.key).length,
  }));

  const openCandidate = (id: string) => setSelectedCandidateId(id);

  const statCards = stats ? [
    { label: 'Total Candidates', value: stats.total, icon: Users, color: 'text-primary' },
    { label: 'New Applications', value: stats.submitted, icon: FileText, color: 'text-blue-500' },
    { label: 'Under Review', value: stats.underReview + stats.shortlisted, icon: Clock, color: 'text-cyan-500' },
    { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-violet-500' },
    { label: 'Offers Issued', value: stats.offers + stats.hired, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Talent Pool', value: stats.pool, icon: UserCheck, color: 'text-teal-500' },
  ] : [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">HR Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Recruitment overview across all Ovid companies.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={cn('mb-2 h-5 w-5', s.color)} />
            <div className="font-serif text-2xl font-semibold">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Pipeline Distribution</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('hr-pipeline')}>
                View board <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {stageDistribution.map((stage) => {
                const total = stats?.total || 1;
                const pct = total > 0 ? (stage.count / total) * 100 : 0;
                return (
                  <div key={stage.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">{stage.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full transition-all', stage.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-primary p-6 text-primary-foreground">
            <TrendingUp className="mb-3 h-6 w-6 text-accent" />
            <h3 className="font-serif text-lg font-semibold">Conversion Rate</h3>
            <p className="mt-1 font-serif text-3xl font-bold text-accent">
              {stats?.conversionRate || 0}%
            </p>
            <p className="mt-1 text-xs text-primary-foreground/60">From application to offer</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-serif text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('hr-pipeline')}>
                <Briefcase className="mr-2 h-4 w-4" /> Open Pipeline Board
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('hr-talent')}>
                <Users className="mr-2 h-4 w-4" /> Search Talent Pool
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('vacancies')}>
                <FileText className="mr-2 h-4 w-4" /> View Open Vacancies
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Recent Applications</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('hr-talent')}>
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2">
            {recent.map((c) => {
              const company = getCompany(c.preferredCompany);
              const vacancy = c.vacancyId ? getVacancy(c.vacancyId) : undefined;
              return (
                <div
                  key={c.id}
                  onClick={() => openCandidate(c.id)}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-border/50 p-3 transition-all hover:border-accent/40 hover:bg-secondary/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm font-semibold">
                    {c.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {vacancy?.title || 'Talent Pool Submission'} · {company?.name || 'General'}
                    </p>
                  </div>
                  <Badge
                    className={cn('hidden border-transparent font-normal sm:inline-flex', statusBadgeClass(c.status))}
                  >
                    {c.status}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground md:block">{formatDate(c.submittedAt)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function statusBadgeClass(status: ApplicationStatus): string {
  const stage = pipelineStages.find((s) => s.key === status);
  if (!stage) return 'bg-muted text-muted-foreground';
  const map: Record<string, string> = {
    'bg-slate-500': 'bg-slate-500 text-white',
    'bg-blue-500': 'bg-blue-500 text-white',
    'bg-cyan-500': 'bg-cyan-500 text-white',
    'bg-violet-500': 'bg-violet-500 text-white',
    'bg-amber-500': 'bg-amber-500 text-white',
    'bg-emerald-500': 'bg-emerald-500 text-white',
    'bg-teal-500': 'bg-teal-500 text-white',
    'bg-rose-500': 'bg-rose-500 text-white',
  };
  return map[stage.color] || 'bg-muted text-muted-foreground';
}