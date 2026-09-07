import { useState, useMemo } from 'react';
import {
  Search, MapPin, Building2, Briefcase, ArrowRight, Sparkles,
  Users, Award, Globe2, TrendingUp, Quote, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { vacancies, companies, departments, locations, getCompany, formatDate } from '@/lib/data';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const companyIcons: Record<string, typeof Building2> = {
  'ovid-realestate': Building2,
  'ovid-hospitality': Building2,
  'ovid-capital': TrendingUp,
  'ovid-construction': Building2,
  'ovid-tech': Building2,
  'ovid-retail': Building2,
};

export function Home() {
  const { navigate } = useApp();
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('all');
  const [location, setLocation] = useState('all');
  const [department, setDepartment] = useState('all');

  const featuredJobs = useMemo(() => vacancies.filter((v) => v.featured).slice(0, 4), []);

  const handleSearch = () => {
    navigate('vacancies', { search, company, location, department });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/85" />
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-accent/15 text-accent-foreground backdrop-blur-sm border border-accent/30">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Welcome to Ovid Real Estate Careers
            </Badge>
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-primary-foreground text-balance sm:text-5xl lg:text-6xl">
              Build a career as remarkable as the places we create
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
              Join a diversified group shaping real estate, hospitality, capital, and technology across the GCC. Find your role among {vacancies.length} open opportunities.
            </p>
          </div>

          {/* Search bar */}
          <div className="mx-auto mt-12 max-w-5xl">
            <Card className="border-border/40 bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Job title or keyword"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger>
                    <Building2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <Briefcase className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Search className="mr-2 h-4 w-4" /> Search Opportunities
              </Button>
            </Card>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: Briefcase, label: 'Open Roles', value: `${vacancies.length}` },
              { icon: Building2, label: 'Subsidiaries', value: '6' },
              { icon: Users, label: 'Team Members', value: '3,400+' },
              { icon: Globe2, label: 'Countries', value: '6' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-accent" />
                <div className="font-serif text-2xl font-semibold text-primary-foreground">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Featured Opportunities</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Open roles, handpicked for you
            </h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('vacancies')} className="hidden sm:inline-flex">
            View all <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} vacancy={job} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('vacancies')}>
            View all vacancies <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Companies */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Our Companies</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Six subsidiaries, one vision
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Each Ovid company is a leader in its field — explore where your expertise fits best.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => {
              const Icon = companyIcons[c.id] || Building2;
              const count = vacancies.filter((v) => v.companyId === c.id).length;
              return (
                <Card
                  key={c.id}
                  className="group cursor-pointer overflow-hidden border-border/60 transition-all hover:shadow-lg hover:border-accent/40"
                  onClick={() => navigate('companies', { id: c.id })}
                >
                  <div className={cn('relative h-28 bg-gradient-to-br', c.accent)}>
                    <div className="absolute inset-0 flex items-center justify-between px-5">
                      <Icon className="h-8 w-8 text-primary/40" />
                      <span className="font-serif text-3xl font-semibold text-primary/30">{c.shortName}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{c.industry}</span>
                      <Badge variant="secondary" className="font-normal">{count} open</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Talent Pool CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Card className="relative overflow-hidden border-0 bg-primary p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-accent/15 text-accent-foreground border border-accent/30">
                <Users className="mr-1.5 h-3.5 w-3.5" /> Talent Pool
              </Badge>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                Don't see the right role?
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-primary-foreground/70">
                Submit your profile to our talent pool. When a matching opportunity opens, our HR team will reach out directly.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('talent-pool')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Join Our Talent Pool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Why Ovid */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Why Ovid</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              A culture of excellence and belonging
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Award, title: 'Premium Standards', desc: 'We hold ourselves to the highest standards in everything we build and deliver.' },
              { icon: TrendingUp, title: 'Growth Pathways', desc: 'Structured career development with mentorship and cross-company mobility.' },
              { icon: Globe2, title: 'Regional Impact', desc: 'Shape projects that define skylines and communities across the GCC.' },
              { icon: Users, title: 'Human-Centric', desc: 'A welcoming culture where every voice matters and wellbeing comes first.' },
            ].map((item) => (
              <Card key={item.title} className="border-border/60 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Card className="relative overflow-hidden border-border/60 bg-card p-8 sm:p-12">
          <Quote className="absolute right-6 top-6 h-16 w-16 text-accent/10" />
          <blockquote className="relative max-w-3xl">
            <p className="font-serif text-xl leading-relaxed tracking-tight sm:text-2xl">
              "Joining Ovid was the best decision of my career. The group invests in your growth, trusts you with meaningful responsibility, and treats you like family. Five years in, I'm leading developments I once only dreamed of."
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-serif font-semibold">
                HA
              </div>
              <div>
                <div className="font-medium">Hassan Al-Rashid</div>
                <div className="text-sm text-muted-foreground">Development Director, Ovid Real Estate</div>
              </div>
            </footer>
          </blockquote>
        </Card>
      </section>
    </div>
  );
}
