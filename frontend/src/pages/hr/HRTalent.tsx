import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, ArrowRight, Eye, Download, Inbox, X,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  departments, locations, pipelineStages, formatDate, type ApplicationStatus, type Company,
} from '@/lib/data';
import * as api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function HRTalent() {
  const { candidates, setSelectedCandidateId } = useApp();
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('all');
  const [department, setDepartment] = useState('all');
  const [location, setLocation] = useState('all');
  const [status, setStatus] = useState('all');
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    api.getCompanies().then((data) => setCompanies(data)).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.fullName.toLowerCase().includes(q) &&
            !c.email.toLowerCase().includes(q) &&
            !c.fieldOfStudy.toLowerCase().includes(q) &&
            !c.reference.toLowerCase().includes(q)) return false;
      }
      if (company !== 'all' && c.preferredCompany !== company) return false;
      if (department !== 'all' && c.preferredDepartment !== department) return false;
      if (location !== 'all' && !c.city.toLowerCase().includes(location.toLowerCase().split(',')[0])) return false;
      if (status !== 'all' && c.status !== status) return false;
      return true;
    });
  }, [candidates, search, company, department, location, status]);

  const activeFilters = [company !== 'all' && company, department !== 'all' && department, location !== 'all' && location, status !== 'all' && status].filter(Boolean);

  const clearAll = () => {
    setCompany('all'); setDepartment('all'); setLocation('all'); setStatus('all'); setSearch('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Talent Pool Search</h1>
        <p className="mt-1 text-muted-foreground">Search and filter all candidates across the Ovid group.</p>
      </div>

      <Card className="mb-6 p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, field of study, or reference number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {pipelineStages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(activeFilters.length > 0 || search) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeFilters.map((f) => (
              <Badge key={f as string} variant="secondary" className="font-normal">
                {companies.find((c) => c.id === f)?.name || f}
              </Badge>
            ))}
            <button onClick={clearAll} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'candidate' : 'candidates'} found
        </p>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No candidates found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search filters.</p>
          <Button variant="outline" onClick={clearAll} className="mt-4">Clear filters</Button>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="min-w-[180px]">Candidate</TableHead>
                  <TableHead className="min-w-[150px]">Field</TableHead>
                  <TableHead className="hidden md:table-cell">Experience</TableHead>
                  <TableHead className="hidden lg:table-cell">Target Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Expected Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  return (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedCandidateId(c.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-xs font-semibold">
                            {c.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{c.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.reference}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.fieldOfStudy}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{c.totalExperience}</TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">
                        {c.vacancy
                          ? <span className="font-medium">{c.vacancy.title}</span>
                          : <span className="text-muted-foreground">Talent Pool</span>}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {c.company?.shortName || companies.find((co) => co.id === c.preferredCompany)?.shortName || '—'}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{c.expectedSalary}</TableCell>
                      <TableCell>
                        <Badge className={cn('border-transparent font-normal', statusBadgeClass(c.status))}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{formatDate(c.submittedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setSelectedCandidateId(c.id); }}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
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