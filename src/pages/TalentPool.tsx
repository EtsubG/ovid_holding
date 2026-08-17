import { useState } from 'react';
import { Users, Sparkles, CheckCircle2, ArrowRight, PartyPopper, Copy, Home } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  companies, departments, locations, jobCategories, generateReference, type Candidate,
} from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dropzone } from '@/components/Dropzone';
import { toast } from 'sonner';

export function TalentPool() {
  const { addCandidate, navigate } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', city: '',
    preferredCompany: '', department: '', jobCategory: '',
    location: '', employmentType: '', experienceLevel: '', availability: '',
    expectedSalary: '', yearsExperience: '', coverNote: '',
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) {
      toast.error('Please fill in your name, email, and phone.');
      return;
    }
    const ref = generateReference();
    setReference(ref);
    const newCandidate: Candidate = {
      id: `c-${Date.now()}`,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      nationality: 'N/A',
      highestQualification: 'N/A',
      fieldOfStudy: 'N/A',
      institution: 'N/A',
      graduationYear: 'N/A',
      cgpa: 'N/A',
      currentStatus: 'N/A',
      totalExperience: form.yearsExperience || 'N/A',
      relevantExperience: 'N/A',
      expectedSalary: form.expectedSalary || 'N/A',
      availability: form.availability || 'N/A',
      preferredCompany: form.preferredCompany,
      preferredDepartment: form.department,
      status: 'Talent Pool',
      submittedAt: new Date().toISOString(),
      documents: [{ name: `${form.fullName.replace(/\s/g, '_')}_CV.pdf`, type: 'PDF', size: '284 KB' }],
      notes: [],
      reference: ref,
    };
    addCandidate(newCandidate);
    setSubmitted(true);
    toast.success('Profile submitted to talent pool!');
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10 text-success">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">You're in our Talent Pool!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you, {form.fullName.split(' ')[0]}. Your profile is now visible to our HR team across all Ovid companies. When a matching role opens, we'll reach out directly.
        </p>
        <div className="mx-auto mt-6 max-w-sm">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Your Reference Number</p>
          <div className="flex items-center justify-between rounded-lg border-2 border-accent/40 bg-accent/5 px-4 py-3">
            <span className="font-mono text-lg font-bold tracking-wider text-accent">#{reference}</span>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(reference); toast.success('Copied!'); }}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('home')}><Home className="mr-2 h-4 w-4" /> Home</Button>
          <Button onClick={() => navigate('vacancies')} className="bg-accent text-accent-foreground hover:bg-accent/90">Browse Jobs <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Badge className="mb-4 bg-accent/10 text-accent-foreground border border-accent/30">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> General Submission
        </Badge>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Join Our Talent Pool</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          No matching role right now? Submit your profile and our HR team will contact you when a fitting opportunity arises across any of our companies.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-semibold">About You</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Full Name <span className="text-destructive">*</span></Label>
                <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Doe" required />
              </div>
              <div>
                <Label className="mb-1.5 block">Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@email.com" required />
              </div>
              <div>
                <Label className="mb-1.5 block">Phone <span className="text-destructive">*</span></Label>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 50 123 4567" required />
              </div>
              <div>
                <Label className="mb-1.5 block">Current City</Label>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dubai, UAE" />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-semibold">Your Preferences</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Preferred Company</Label>
                <Select value={form.preferredCompany} onValueChange={(v) => set('preferredCompany', v)}>
                  <SelectTrigger><SelectValue placeholder="Any company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Preferred Department</Label>
                <Select value={form.department} onValueChange={(v) => set('department', v)}>
                  <SelectTrigger><SelectValue placeholder="Any department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Job Category</Label>
                <Select value={form.jobCategory} onValueChange={(v) => set('jobCategory', v)}>
                  <SelectTrigger><SelectValue placeholder="Any category" /></SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Preferred Location</Label>
                <Select value={form.location} onValueChange={(v) => set('location', v)}>
                  <SelectTrigger><SelectValue placeholder="Any location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Employment Type</Label>
                <Select value={form.employmentType} onValueChange={(v) => set('employmentType', v)}>
                  <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Experience Level</Label>
                <Select value={form.experienceLevel} onValueChange={(v) => set('experienceLevel', v)}>
                  <SelectTrigger><SelectValue placeholder="Any level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid Level">Mid Level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Years of Experience</Label>
                <Input value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} placeholder="5 years" />
              </div>
              <div>
                <Label className="mb-1.5 block">Availability</Label>
                <Select value={form.availability} onValueChange={(v) => set('availability', v)}>
                  <SelectTrigger><SelectValue placeholder="When can you start?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="1 month notice">1 month notice</SelectItem>
                    <SelectItem value="2 months notice">2 months notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Expected Salary</Label>
                <Input value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} placeholder="AED 20,000 / mo" />
              </div>
            </div>
          </section>

          {/* Cover note + CV */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-semibold">Your CV</h2>
            <div className="mb-4">
              <Label className="mb-1.5 block">Cover Note (Optional)</Label>
              <Textarea
                value={form.coverNote}
                onChange={(e) => set('coverNote', e.target.value)}
                placeholder="Tell us briefly about your career goals and what kind of role you're looking for..."
                className="min-h-[100px]"
              />
            </div>
            <Dropzone label="CV / Resume" required accept=".pdf,.doc,.docx" multiple={false} />
          </section>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Users className="mr-2 h-4 w-4" /> Submit to Talent Pool
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
