import { useState, useMemo } from 'react';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Building2, Wallet, Calendar,
  CheckCircle2, FileText, AlertCircle, ArrowRight, Share2, Bookmark,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { getVacancy, getCompany, formatDate } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApplicationForm } from '@/components/ApplicationForm';
import { Skeleton } from '@/components/ui/skeleton';

export function VacancyDetail() {
  const { params, navigate } = useApp();
  const vacancy = useMemo(() => getVacancy(params.id), [params.id]);
  const [applyOpen, setApplyOpen] = useState(false);

  if (!vacancy) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-semibold">Role not found</h1>
        <Button variant="outline" onClick={() => navigate('vacancies')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to vacancies
        </Button>
      </div>
    );
  }

  const company = getCompany(vacancy.companyId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('vacancies')}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vacancies
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary font-serif text-lg font-semibold">
                {company?.shortName}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{company?.name}</p>
                <p className="text-xs text-muted-foreground/70">{vacancy.department}</p>
              </div>
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {vacancy.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{vacancy.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-normal"><MapPin className="mr-1 h-3 w-3" /> {vacancy.location}</Badge>
              <Badge variant="secondary" className="font-normal"><Briefcase className="mr-1 h-3 w-3" /> {vacancy.type}</Badge>
              <Badge variant="secondary" className="font-normal"><Clock className="mr-1 h-3 w-3" /> {vacancy.experienceYears}</Badge>
              <Badge variant="secondary" className="font-normal"><Building2 className="mr-1 h-3 w-3" /> {vacancy.experienceLevel}</Badge>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-xl font-semibold">Role Overview</h2>
            <p className="leading-relaxed text-muted-foreground">{vacancy.description}</p>
          </section>

          {/* Responsibilities */}
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-xl font-semibold">What You'll Do</h2>
            <ul className="space-y-2.5">
              {vacancy.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section className="mb-8">
            <h2 className="mb-3 font-serif text-xl font-semibold">What You'll Need</h2>
            <ul className="space-y-2.5">
              {vacancy.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Preferred */}
          {vacancy.preferred.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 font-serif text-xl font-semibold">Nice to Have</h2>
              <ul className="space-y-2.5">
                {vacancy.preferred.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Documents checklist */}
          <section className="mb-8">
            <Card className="border-accent/30 bg-accent/5 p-5">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold">Required Documents Checklist</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Please have the following documents ready before you start your application:
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {vacancy.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent text-accent">
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* Sidebar - sticky apply */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="p-5">
              <h3 className="mb-4 font-serif text-lg font-semibold">Job Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> Salary</dt>
                  <dd className="font-medium">{vacancy.salaryRange}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</dt>
                  <dd className="font-medium">{vacancy.location}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> Type</dt>
                  <dd className="font-medium">{vacancy.type}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Experience</dt>
                  <dd className="font-medium">{vacancy.experienceYears}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Posted</dt>
                  <dd className="font-medium">{formatDate(vacancy.postedDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Closes</dt>
                  <dd className="font-medium text-destructive">{formatDate(vacancy.closingDate)}</dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <Button
                onClick={() => setApplyOpen(true)}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                </Button>
              </div>
            </Card>

            <Card className="bg-secondary/40 p-5">
              <h4 className="mb-2 text-sm font-semibold">About {company?.name}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{company?.description}</p>
              <button
                onClick={() => navigate('companies', { id: company!.id })}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Learn more <ArrowRight className="h-3 w-3" />
              </button>
            </Card>
          </div>
        </div>
      </div>

      <ApplicationForm open={applyOpen} onOpenChange={setApplyOpen} vacancyId={vacancy.id} />
    </div>
  );
}
