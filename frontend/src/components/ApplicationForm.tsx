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

export function ApplicationForm({ open, onOpenChange, vacancyId }: { open: boolean; onOpenChange: (v: boolean) => void; vacancyId: string }) {
  const { navigate, addCandidate } = useApp();
  const vacancy = useMemo(() => getVacancy(vacancyId), [vacancyId]);
  const company = vacancy ? getCompany(vacancy.companyId) : undefined;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const submit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare data matching your backend's expected format
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

      // Submit to backend
      const result = await api.submitApplication(formData);
      
      // Use the reference from the backend
      const backendReference = result.reference || generateReference();
      setReference(backendReference);

      // Create candidate object for local state
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
          {/* ... rest of your form fields (same as before) ... */}
          {/* Keep all the step 1-5 content exactly as you have it */}
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
              <Button 
                onClick={submit} 
                className="bg-success text-success-foreground hover:bg-success/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                {!isSubmitting && <Check className="ml-1 h-4 w-4" />}
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