import { useState, useEffect } from 'react';
import {
  Check, ChevronRight, ChevronLeft, User, GraduationCap,
  Briefcase, Upload, PartyPopper, Copy, Home, Loader2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  generateReference, type Candidate, type Vacancy, type Company,
} from '@/lib/data';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dropzone } from '@/components/Dropzone';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as api from '@/lib/api';

const steps = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Academic', icon: GraduationCap },
  { id: 3, label: 'Employment', icon: Briefcase },
  { id: 4, label: 'Documents', icon: Upload },
  { id: 5, label: 'Confirm', icon: Check },
];

interface FormState {
  fullName: string; email: string; phone: string; altPhone: string;
  city: string; nationality: string; idType: string; idNumber: string;
  qualification: string; fieldOfStudy: string; institution: string;
  graduationYear: string; cgpa: string; certificates: string;
  currentStatus: string; currentEmployer: string; currentRole: string;
  totalExperience: string; relevantExperience: string; availability: string;
  expectedSalary: string;
}

const empty: FormState = {
  fullName: '', email: '', phone: '', altPhone: '', city: '', nationality: '',
  idType: 'National ID', idNumber: '', qualification: '', fieldOfStudy: '',
  institution: '', graduationYear: '', cgpa: '', certificates: '',
  currentStatus: 'Employed', currentEmployer: '', currentRole: '',
  totalExperience: '', relevantExperience: '', availability: '', expectedSalary: '',
};

export function ApplicationForm({
  open,
  onOpenChange,
  vacancyId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vacancyId: string;
}) {
  const { navigate, addCandidate } = useApp();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingVacancy, setLoadingVacancy] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vacancy from API when dialog opens
  useEffect(() => {
    if (!open || !vacancyId) return;
    const fetch = async () => {
      try {
        setLoadingVacancy(true);
        const v = await api.getVacancy(vacancyId);
        setVacancy(v);
        // The API returns the nested company object on the vacancy
        if (v.company) {
          setCompany(v.company);
        } else if (v.companyId) {
          const c = await api.getCompany(v.companyId);
          setCompany(c);
        }
      } catch {
        toast.error('Failed to load vacancy details');
      } finally {
        setLoadingVacancy(false);
      }
    };
    fetch();
  }, [open, vacancyId]);

  const set = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
      if (!form.phone.trim()) e.phone = 'Phone is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.nationality.trim()) e.nationality = 'Nationality is required';
    }
    if (s === 2) {
      if (!form.qualification) e.qualification = 'Required';
      if (!form.fieldOfStudy.trim()) e.fieldOfStudy = 'Required';
      if (!form.institution.trim()) e.institution = 'Required';
      if (!form.graduationYear.trim()) e.graduationYear = 'Required';
    }
    if (s === 3) {
      if (!form.totalExperience.trim()) e.totalExperience = 'Required';
      if (!form.expectedSalary.trim()) e.expectedSalary = 'Required';
      if (!form.availability.trim()) e.availability = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step) && step < 5) setStep(step + 1); };
  const back = () => step > 1 && setStep(step - 1);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const formData = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        altPhone: form.altPhone || '',
        city: form.city,
        nationality: form.nationality,
        idType: form.idType,
        idNumber: form.idNumber,
        qualification: form.qualification,
        fieldOfStudy: form.fieldOfStudy,
        institution: form.institution,
        graduationYear: form.graduationYear,
        cgpa: form.cgpa || 'N/A',
        certificates: form.certificates || '',
        currentStatus: form.currentStatus,
        currentEmployer: form.currentEmployer || '',
        currentRole: form.currentRole || '',
        totalExperience: form.totalExperience,
        relevantExperience: form.relevantExperience || 'N/A',
        expectedSalary: form.expectedSalary,
        availability: form.availability,
        preferredCompany: vacancy?.companyId || '',
        preferredDepartment: vacancy?.department || '',
        vacancyId: vacancy?.id || null,
      };

      const result = await api.submitApplication(formData);
      const backendReference = result.reference || generateReference();
      setReference(backendReference);

      const newCandidate: Candidate = {
        id: result.id || `c-${Date.now()}`,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        altPhone: form.altPhone || undefined,
        city: form.city,
        nationality: form.nationality,
        highestQualification: form.qualification,
        fieldOfStudy: form.fieldOfStudy,
        institution: form.institution,
        graduationYear: form.graduationYear,
        cgpa: form.cgpa || 'N/A',
        currentStatus: form.currentStatus,
        currentEmployer: form.currentEmployer || undefined,
        currentRole: form.currentRole || undefined,
        totalExperience: form.totalExperience,
        relevantExperience: form.relevantExperience || 'N/A',
        expectedSalary: form.expectedSalary,
        availability: form.availability,
        preferredCompany: vacancy?.companyId || '',
        preferredDepartment: vacancy?.department || '',
        vacancyId: vacancy?.id,
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        documents: [
          { name: `${form.fullName.replace(/\s/g, '_')}_CV.pdf`, type: 'PDF', size: '284 KB' },
          { name: 'Cover_Letter.pdf', type: 'PDF', size: '112 KB' },
        ],
        notes: [],
        reference: backendReference,
        company: company ? { id: company.id, name: company.name, shortName: company.shortName } : undefined,
        vacancy: vacancy ? { id: vacancy.id, title: vacancy.title, department: vacancy.department } : undefined,
      };

      addCandidate(newCandidate);
      setStep(5);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setForm(empty);
    setStep(1);
    setReference('');
    setErrors({});
    setVacancy(null);
    setCompany(null);
    onOpenChange(false);
  };

  const closeAndNavigate = (page: string) => {
    reset();
    navigate(page);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-xl">
            {step === 5 ? 'Application Submitted' : loadingVacancy ? 'Loading…' : `Apply: ${vacancy?.title ?? 'Role'}`}
          </DialogTitle>
          <DialogDescription>
            {step === 5
              ? 'Your application has been received'
              : loadingVacancy
              ? 'Fetching vacancy details…'
              : `${company?.name ?? ''} · ${vacancy?.location ?? ''} · Step ${step} of 4`}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        {step < 5 && (
          <div className="px-6 pt-5">
            <div className="flex items-center justify-between">
              {steps.slice(0, 4).map((s, i) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                          isDone && 'border-success bg-success text-success-foreground',
                          isActive && 'border-accent bg-accent text-accent-foreground',
                          !isActive && !isDone && 'border-border bg-background text-muted-foreground'
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                      </div>
                      <span className={cn('text-[10px] font-medium uppercase tracking-wide', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                        {s.label}
                      </span>
                    </div>
                    {i < 3 && (
                      <div className={cn('mx-1 h-0.5 flex-1 rounded-full transition-colors', isDone ? 'bg-success' : 'bg-border')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadingVacancy && step < 5 ? (
          <div className="flex items-center justify-center px-6 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">

            {/* Step 1 – Personal Information */}
            {step === 1 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required error={errors.fullName}>
                    <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@email.com" />
                  </Field>
                  <Field label="Phone" required error={errors.phone}>
                    <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 50 123 4567" />
                  </Field>
                  <Field label="Alternate Phone" error={errors.altPhone}>
                    <Input value={form.altPhone} onChange={(e) => set('altPhone', e.target.value)} placeholder="+971 50 000 0000" />
                  </Field>
                  <Field label="Current City" required error={errors.city}>
                    <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dubai, UAE" />
                  </Field>
                  <Field label="Nationality" required error={errors.nationality}>
                    <Input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} placeholder="UAE" />
                  </Field>
                  <Field label="ID Type" error={errors.idType}>
                    <Select value={form.idType} onValueChange={(v) => set('idType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National ID">National ID</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Residence Visa">Residence Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="ID Number" error={errors.idNumber}>
                    <Input value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} placeholder="784-XXXX-XXXXXXX-X" />
                  </Field>
                </div>
              </>
            )}

            {/* Step 2 – Academic Background */}
            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Highest Qualification" required error={errors.qualification}>
                    <Select value={form.qualification} onValueChange={(v) => set('qualification', v)}>
                      <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                        <SelectItem value="Master's">Master's</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Professional Certification">Professional Certification</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Field of Study" required error={errors.fieldOfStudy}>
                    <Input value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} placeholder="Business Administration" />
                  </Field>
                  <Field label="Institution" required error={errors.institution}>
                    <Input value={form.institution} onChange={(e) => set('institution', e.target.value)} placeholder="University of Dubai" />
                  </Field>
                  <Field label="Graduation Year" required error={errors.graduationYear}>
                    <Input value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} placeholder="2020" />
                  </Field>
                  <Field label="CGPA / Grade" error={errors.cgpa}>
                    <Input value={form.cgpa} onChange={(e) => set('cgpa', e.target.value)} placeholder="3.8 / 4.0" />
                  </Field>
                </div>
                <Field label="Additional Certificates" error={errors.certificates}>
                  <Textarea
                    value={form.certificates}
                    onChange={(e) => set('certificates', e.target.value)}
                    placeholder="List any professional certifications, e.g. PMP, CFA, AWS…"
                    className="min-h-[80px]"
                  />
                </Field>
              </>
            )}

            {/* Step 3 – Employment Details */}
            {step === 3 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current Status" error={errors.currentStatus}>
                    <Select value={form.currentStatus} onValueChange={(v) => set('currentStatus', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employed">Employed</SelectItem>
                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Current Employer" error={errors.currentEmployer}>
                    <Input value={form.currentEmployer} onChange={(e) => set('currentEmployer', e.target.value)} placeholder="Acme Corp" />
                  </Field>
                  <Field label="Current Role / Title" error={errors.currentRole}>
                    <Input value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} placeholder="Senior Manager" />
                  </Field>
                  <Field label="Total Experience" required error={errors.totalExperience}>
                    <Input value={form.totalExperience} onChange={(e) => set('totalExperience', e.target.value)} placeholder="5 years" />
                  </Field>
                  <Field label="Relevant Experience" error={errors.relevantExperience}>
                    <Input value={form.relevantExperience} onChange={(e) => set('relevantExperience', e.target.value)} placeholder="3 years" />
                  </Field>
                  <Field label="Expected Salary" required error={errors.expectedSalary}>
                    <Input value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} placeholder="AED 25,000 / mo" />
                  </Field>
                  <Field label="Availability" required error={errors.availability}>
                    <Select value={form.availability} onValueChange={(v) => set('availability', v)}>
                      <SelectTrigger><SelectValue placeholder="When can you start?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="2 weeks">2 weeks</SelectItem>
                        <SelectItem value="1 month notice">1 month notice</SelectItem>
                        <SelectItem value="2 months notice">2 months notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </>
            )}

            {/* Step 4 – Documents */}
            {step === 4 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Upload the required documents below. Accepted formats: PDF, DOC, DOCX.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">CV / Resume <span className="text-destructive">*</span></p>
                    <Dropzone label="CV / Resume" required accept=".pdf,.doc,.docx" multiple={false} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Cover Letter</p>
                    <Dropzone label="Cover Letter" accept=".pdf,.doc,.docx" multiple={false} />
                  </div>
                  {vacancy?.documents && vacancy.documents.length > 0 && (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="mb-2 text-sm font-semibold">Additional required documents for this role:</p>
                      <ul className="space-y-1">
                        {vacancy.documents.map((doc, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 5 – Success */}
            {step === 5 && (
              <div className="py-8 text-center">
                <div className="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10 text-success">
                  <PartyPopper className="h-8 w-8" />
                </div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight">Application Received!</h2>
                <p className="mt-2 text-muted-foreground">
                  Thank you, {form.fullName.split(' ')[0]}. We'll review your application and be in touch soon.
                </p>
                <div className="mx-auto mt-6 max-w-xs">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Your Reference Number</p>
                  <div className="flex items-center justify-between rounded-lg border-2 border-accent/40 bg-accent/5 px-4 py-3">
                    <span className="font-mono text-lg font-bold tracking-wider text-accent">#{reference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { navigator.clipboard.writeText(reference); toast.success('Copied!'); }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => closeAndNavigate('home')}>
                    <Home className="mr-2 h-4 w-4" /> Home
                  </Button>
                  <Button onClick={() => closeAndNavigate('vacancies')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Browse More Jobs
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer nav */}
        {step < 5 && !loadingVacancy && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={next} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                className="bg-success text-success-foreground hover:bg-success/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Check className="mr-1 h-4 w-4" /> Submit Application</>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
