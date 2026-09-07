import { useMemo, useState } from 'react';
import {
  X, Mail, Phone, MapPin, FileText, Clock, Briefcase, GraduationCap,
  Wallet, Calendar, MessageSquare, Send, ChevronRight, User, FileCheck,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  pipelineStages, formatDateTime, formatDate,
  type ApplicationStatus, type Candidate,
} from '@/lib/data';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CandidateDrawer() {
  const {
    selectedCandidateId, setSelectedCandidateId, candidates,
    updateCandidateStatus, addCandidateNote,
  } = useApp();
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');

  const candidate = useMemo(
    () => candidates.find((c) => c.id === selectedCandidateId) || null,
    [candidates, selectedCandidateId]
  );

  const open = !!candidate;

  const handleClose = () => {
    setSelectedCandidateId(null);
    setNote('');
    setNewStatus('');
  };

  if (!candidate) {
    return <Sheet open={false} onOpenChange={() => {}}><SheetContent /></Sheet>;
  }

  const company = candidate.company ?? null;
  const vacancy = candidate.vacancy ?? null;

  const handleStatusChange = (value: ApplicationStatus) => {
    updateCandidateStatus(candidate.id, value);
    setNewStatus('');
    toast.success(`Status updated to "${value}"`);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addCandidateNote(candidate.id, note.trim());
    setNote('');
    toast.success('Note added');
  };

  const sendEmail = (type: string) => {
    toast.success(`${type} email sent to ${candidate.fullName}`);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-2xl scrollbar-thin">
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-serif font-semibold">
                {candidate.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <SheetTitle className="font-serif text-xl">{candidate.fullName}</SheetTitle>
                <SheetDescription className="text-sm">
                  {candidate.fieldOfStudy} · {candidate.totalExperience} exp
                </SheetDescription>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className={cn('border-transparent font-normal', statusColor(candidate.status))}>
              {candidate.status}
            </Badge>
            {vacancy && <Badge variant="secondary" className="font-normal">{vacancy.title}</Badge>}
            {company && <Badge variant="outline" className="font-normal">{company.name}</Badge>}
          </div>
        </SheetHeader>

        <div className="px-6 py-5">
          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1"><User className="mr-1.5 h-3.5 w-3.5" /> Profile</TabsTrigger>
              <TabsTrigger value="documents" className="flex-1"><FileText className="mr-1.5 h-3.5 w-3.5" /> Documents</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Activity</TabsTrigger>
            </TabsList>

            {/* Profile tab */}
            <TabsContent value="profile" className="mt-4 space-y-5">
              <Section title="Contact Information">
                <InfoRow icon={Mail} label="Email" value={candidate.email} />
                <InfoRow icon={Phone} label="Phone" value={candidate.phone} />
                {candidate.altPhone && <InfoRow icon={Phone} label="Alt Phone" value={candidate.altPhone} />}
                <InfoRow icon={MapPin} label="City" value={candidate.city} />
                <InfoRow icon={User} label="Nationality" value={candidate.nationality} />
              </Section>

              <Section title="Academic Background">
                <InfoRow icon={GraduationCap} label="Qualification" value={candidate.highestQualification} />
                <InfoRow icon={FileText} label="Field of Study" value={candidate.fieldOfStudy} />
                <InfoRow icon={FileText} label="Institution" value={candidate.institution} />
                <InfoRow icon={Calendar} label="Graduation Year" value={candidate.graduationYear} />
                <InfoRow icon={FileCheck} label="CGPA" value={candidate.cgpa} />
              </Section>

              <Section title="Employment Details">
                <InfoRow icon={Briefcase} label="Current Status" value={candidate.currentStatus} />
                {candidate.currentEmployer && <InfoRow icon={Briefcase} label="Employer" value={candidate.currentEmployer} />}
                {candidate.currentRole && <InfoRow icon={Briefcase} label="Role" value={candidate.currentRole} />}
                <InfoRow icon={Clock} label="Total Experience" value={candidate.totalExperience} />
                <InfoRow icon={Clock} label="Relevant Experience" value={candidate.relevantExperience} />
                <InfoRow icon={Wallet} label="Expected Salary" value={candidate.expectedSalary} />
                <InfoRow icon={Calendar} label="Availability" value={candidate.availability} />
              </Section>

              {/* Status changer */}
              <Section title="Update Status">
                <Select value={newStatus || undefined} onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
                  <SelectTrigger><SelectValue placeholder="Change pipeline status" /></SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Section>

              {/* Quick actions */}
              <Section title="Quick Actions">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => sendEmail('Schedule Interview')}>
                    <Calendar className="mr-1.5 h-3.5 w-3.5" /> Schedule Interview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendEmail('Rejection Notice')}>
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Send Rejection
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => sendEmail('Offer Letter')}>
                    <FileCheck className="mr-1.5 h-3.5 w-3.5" /> Send Offer
                  </Button>
                </div>
              </Section>
            </TabsContent>

            {/* Documents tab */}
            <TabsContent value="documents" className="mt-4">
              <Section title="Uploaded Documents">
                {candidate.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {candidate.documents.map((doc, i) => (
                      <div
                        key={i}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 transition-all hover:border-accent/40 hover:bg-accent/5"
                        onClick={() => toast.info(`Previewing ${doc.name}...`)}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Click any document to preview it within the portal — no download required.
                </p>
              </Section>
            </TabsContent>

            {/* Activity tab */}
            <TabsContent value="activity" className="mt-4 space-y-4">
              <Section title="Application Timeline">
                <div className="space-y-3">
                  <TimelineItem
                    date={formatDateTime(candidate.submittedAt)}
                    title="Application Submitted"
                    desc={`Reference #${candidate.reference}`}
                    active
                  />
                  {candidate.notes.map((n, i) => (
                    <TimelineItem
                      key={i}
                      date={n.date}
                      title={`Note by ${n.author}`}
                      desc={n.text}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Add Reviewer Note">
                <Label className="mb-1.5 block text-sm font-medium">Note</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this candidate..."
                  className="min-h-[80px]"
                />
                <Button size="sm" className="mt-2" onClick={handleAddNote} disabled={!note.trim()}>
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Add Note
                </Button>
              </Section>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({ date, title, desc, active }: { date: string; title: string; desc: string; active?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('h-3 w-3 rounded-full', active ? 'bg-accent' : 'bg-muted-foreground/30')} />
        <div className="h-full w-px bg-border" />
      </div>
      <div className="pb-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function statusColor(status: ApplicationStatus): string {
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
