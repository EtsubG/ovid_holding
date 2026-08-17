import { useState, useMemo } from 'react';
import {
  Check, ChevronRight, ChevronLeft, User, GraduationCap,
  Briefcase, Upload, PartyPopper, Copy, Home, Search,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  getVacancy, getCompany, generateReference, companies, departments, locations,
  jobCategories, type Candidate, type EmploymentType, type ExperienceLevel,
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

export function ApplicationForm({ open, onOpenChange, vacancyId }: { open: boolean; onOpenChange: (v: boolean) => void; vacancyId: string }) {
  const { navigate, addCandidate } = useApp();
  const vacancy = useMemo(() => getVacancy(vacancyId), [vacancyId]);
  const company = vacancy ? getCompany(vacancy.companyId) : undefined;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const next = () => {
    if (validateStep(step)) {
      if (step < 5) setStep(step + 1);
    }
  };

  const back = () => step > 1 && setStep(step - 1);

  const submit = () => {
    const ref = generateReference();
    setReference(ref);
    const newCandidate: Candidate = {
      id: `c-${Date.now()}`,
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
      reference: ref,
    };
    addCandidate(newCandidate);
    setStep(5);
    toast.success('Application submitted successfully!');
  };

  const reset = () => {
    setForm(empty);
    setStep(1);
    setReference('');
    setErrors({});
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
            {step === 5 ? 'Application Submitted' : `Apply: ${vacancy?.title}`}
          </DialogTitle>
          <DialogDescription>
            {step === 5
              ? 'Your application has been received'
              : `${company?.name} · ${vacancy?.location} · Step ${step} of 4`}
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

        {/* Form body */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold">Personal Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required error={errors.fullName}>
                  <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Doe" />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@email.com" />
                </Field>
                <Field label="Primary Phone" required error={errors.phone}>
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 50 123 4567" />
                </Field>
                <Field label="Alternative Phone">
                  <Input value={form.altPhone} onChange={(e) => set('altPhone', e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Current City / Region" required error={errors.city}>
                  <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dubai, UAE" />
                </Field>
                <Field label="Nationality" required error={errors.nationality}>
                  <Input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} placeholder="Emirati" />
                </Field>
                <Field label="Identity Type">
                  <Select value={form.idType} onValueChange={(v) => set('idType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Residence ID">Residence ID</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Identity Number">
                  <Input value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} placeholder="Optional" />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold">Academic Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Highest Qualification" required error={errors.qualification}>
                  <Select value={form.qualification} onValueChange={(v) => set('qualification', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Field of Study" required error={errors.fieldOfStudy}>
                  <Input value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} placeholder="Civil Engineering" />
                </Field>
                <Field label="Institution" required error={errors.institution}>
                  <Input value={form.institution} onChange={(e) => set('institution', e.target.value)} placeholder="University name" />
                </Field>
                <Field label="Graduation Year" required error={errors.graduationYear}>
                  <Input value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} placeholder="2019" />
                </Field>
                <Field label="CGPA / Result">
                  <Input value={form.cgpa} onChange={(e) => set('cgpa', e.target.value)} placeholder="3.8 / 4.0" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Professional Certificates">
                    <Textarea value={form.certificates} onChange={(e) => set('certificates', e.target.value)} placeholder="PMP, CFA Level I, etc. (one per line)" className="min-h-[70px]" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold">Employment Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current Status">
                  <Select value={form.currentStatus} onValueChange={(v) => set('currentStatus', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                      <SelectItem value="Self-employed">Self-employed</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Current Employer">
                  <Input value={form.currentEmployer} onChange={(e) => set('currentEmployer', e.target.value)} placeholder="Company name" />
                </Field>
                <Field label="Current Role">
                  <Input value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} placeholder="Senior Manager" />
                </Field>
                <Field label="Total Experience (Years)" required error={errors.totalExperience}>
                  <Input value={form.totalExperience} onChange={(e) => set('totalExperience', e.target.value)} placeholder="8 years" />
                </Field>
                <Field label="Relevant Experience (Years)">
                  <Input value={form.relevantExperience} onChange={(e) => set('relevantExperience', e.target.value)} placeholder="6 years" />
                </Field>
                <Field label="Availability Period" required error={errors.availability}>
                  <Select value={form.availability} onValueChange={(v) => set('availability', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="1 month notice">1 month notice</SelectItem>
                      <SelectItem value="2 months notice">2 months notice</SelectItem>
                      <SelectItem value="3 months notice">3 months notice</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Expected Salary" required error={errors.expectedSalary}>
                  <Input value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} placeholder="AED 25,000 / mo" />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-semibold">Document Uploads</h3>
              <p className="text-sm text-muted-foreground">Upload your documents in PDF, DOC, or DOCX format. Max 10MB per file.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Dropzone label="CV / Resume" required accept=".pdf,.doc,.docx" multiple={false} />
                <Dropzone label="Cover Letter" accept=".pdf,.doc,.docx" multiple={false} />
                <Dropzone label="Academic Certificates" accept=".pdf,.jpg,.png" />
                <Dropzone label="Experience Letters" accept=".pdf,.jpg,.png" />
                <div className="sm:col-span-2">
                  <Dropzone label="Supporting Documents" description="Portfolio, recommendations, or other relevant files" accept=".pdf,.doc,.docx,.jpg,.png,.zip" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <PartyPopper className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">Application Received!</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Thank you, {form.fullName.split(' ')[0]}. Your application for <strong className="text-foreground">{vacancy?.title}</strong> at {company?.name} has been submitted successfully.
              </p>
              <div className="mt-6 w-full max-w-sm">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Your Application Reference</p>
                <div className="flex items-center justify-between rounded-lg border-2 border-accent/40 bg-accent/5 px-4 py-3">
                  <span className="font-mono text-lg font-bold tracking-wider text-accent">#{reference}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(reference); toast.success('Reference copied!'); }}
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Save this reference number. You'll need it for any follow-up inquiries. Our HR team will contact you within 5-7 business days.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => closeAndNavigate('home')}>
                  <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
                <Button onClick={() => closeAndNavigate('vacancies')} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Search className="mr-2 h-4 w-4" /> Browse More Jobs
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 5 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={next} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} className="bg-success text-success-foreground hover:bg-success/90">
                Submit Application <Check className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
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
