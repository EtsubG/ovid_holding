import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Building2, Briefcase, Inbox } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { vacancies, companies, departments, locations, getCompany } from '@/lib/data';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export function Vacancies() {
  const { params } = useApp();
  const [search, setSearch] = useState(params.search || '');
  const [company, setCompany] = useState(params.company || 'all');
  const [location, setLocation] = useState(params.location || 'all');
  const [department, setDepartment] = useState(params.department || 'all');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.summary.toLowerCase().includes(search.toLowerCase())) return false;
      if (company !== 'all' && v.companyId !== company) return false;
      if (location !== 'all' && v.location !== location) return false;
      if (department !== 'all' && v.department !== department) return false;
      if (type !== 'all' && v.type !== type) return false;
      return true;
    });
  }, [search, company, location, department, type]);

  const activeFilters = [company !== 'all' && company, location !== 'all' && location, department !== 'all' && department, type !== 'all' && type].filter(Boolean);

  const clearAll = () => {
    setCompany('all'); setLocation('all'); setDepartment('all'); setType('all'); setSearch('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Open Positions</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Find your next opportunity
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse all open roles across the Ovid group of companies.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="h-10"><Building2 className="mr-1.5 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-10"><MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-10"><Briefcase className="mr-1.5 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-10"><SlidersHorizontal className="mr-1.5 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(activeFilters.length > 0 || search) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFilters.map((f) => (
              <Badge key={f as string} variant="secondary" className="font-normal">{getCompany(f as string)?.name || f}</Badge>
            ))}
            <button onClick={clearAll} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'role' : 'roles'} found`}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No matching roles</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or join our talent pool.</p>
          <Button variant="outline" onClick={clearAll} className="mt-4">Clear filters</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} vacancy={job} />
          ))}
        </div>
      )}
    </div>
  );
}
