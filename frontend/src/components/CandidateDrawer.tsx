// frontend/src/components/CandidateDrawer.tsx
import { useMemo, useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, FileText, Clock, Briefcase, GraduationCap,
  Wallet, Calendar, MessageSquare, Send, ChevronRight, User, FileCheck,
  Eye, Download, ExternalLink, Plus,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { api, type Interview } from '@/lib/api';
import {
  pipelineStages, formatDateTime, formatDate,
  type ApplicationStatus,
} from '@/lib/data';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InterviewScheduler } from '@/components/InterviewScheduler';
import { InterviewList } from '@/components/InterviewList';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CandidateDrawer() {
  const {
    selectedCandidateId, setSelectedCandidateId, candidates,
    updateCandidateStatus, addCandidateNote,
  } = useApp();
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [company, setCompany] = useState<any>(null);
  const [vacancy, setVacancy] = useState<any>(null);
  const [previewDoc, setPreviewDoc] = useState<{ filename: string; name: string } | null>(null);

  // Interview state
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const candidate = useMemo(
    () => candidates.find((c) => c.id === selectedCandidateId) || null,
    [candidates, selectedCandidateId]
  );

  const open = !!candidate;

  // Fetch company + vacancy + interviews
  useEffect(() => {
    if (!candidate) {
      setCompany(null);
      setVacancy(null);
      setInterviews([]);
      return;
    }

    // Company + vacancy
    const fetchRelated = async () => {
      try {
        const promises: Promise<any>[] = [];
        if (candidate.preferredCompany) {
          promises.push(api.getCompany(candidate.preferredCompany));
        } else {
          promises.push(Promise.resolve(null));
        }
        if (candidate.vacancyId) {
          promises.push(api.getVacancy(candidate.vacancyId));
        } else {
          promises.push(Promise.resolve(null));
        }
        const [companyData, vacancyData] = await Promise.all(promises);
        setCompany(companyData);
        setVacancy(vacancyData);
      } catch (error) {
        console.error('Failed to fetch related data:', error);
      }
    };

    // Interviews
    const fetchInterviews = async () => {
      try {
        const data = await api.getCandidateInterviews(candidate.id);
        setInterviews(data);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      }
    };

    fetchRelated();
    fetchInterviews();
  }, [candidate]);

  const refreshInterviews = async () => {
    if (!candidate) return;
    try {
      const fresh = await api.getCandidateInterviews(candidate.id);
      setInterviews(fresh);
    } catch (error) {
      console.error('Failed to refresh interviews:', error);
    }
  };

  const handleClose = () => {
    setSelectedCandidateId(null);
    setNote('');
    setNewStatus('');
    setPreviewDoc(null);
    setInterviews([]);
    setEditingInterview(null);
    setInterviewOpen(false);
  };

  if (!candidate) {
    return <Sheet open={false} onOpenChange={() => {}}><SheetContent /></Sheet>;
  }

  const handleStatusChange = async (value: ApplicationStatus) => {
    try {
      await updateCandidateStatus(candidate.id, value);
      setNewStatus('');
      toast.success(`Status updated to "${value}"`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await addCandidateNote(candidate.id, note.trim());
      setNote('');
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const sendEmail = (type: string) => {
    toast.success(`${type} email queued for ${candidate.fullName}`);
  };

  // Preview handler
  const handlePreview = (filename: string, docName: string) => {
    if (!filename) {
      toast.error('Document file not available');
      return;
    }
    setPreviewDoc({ filename, name: docName });
  };

  // Download handler
  const handleDownload = async (filename: string, docName: string) => {
    if (!filename) {
      toast.error('Document file not available');
      return;
    }
    try {
      const url = api.getDownloadUrl(candidate.id, filename);
      const token = localStorage.getItem('ovid_auth_token');

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = docName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success(`Downloaded ${docName}`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  return (
    <>
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
                <TabsTrigger value="profile" className="flex-1">
                  <User className="mr-1.5 h-3.5 w-3.5" /> Profile
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1">
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> Documents
                </TabsTrigger>
                <TabsTrigger value="interviews" className="flex-1">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" /> Interviews
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Activity
                </TabsTrigger>
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

                <Section title="Quick Actions">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingInterview(null);
                        setInterviewOpen(true);
                      }}
                    >
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
                      {candidate.documents.map((doc: any, i: number) => (
                        <div
                          key={i}
                          className="group flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 transition-all hover:border-accent/40 hover:bg-accent/5"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handlePreview(doc.filename, doc.name)}
                              disabled={!doc.filename}
                              title={doc.filename ? 'Preview' : 'File not stored'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(doc.filename, doc.name)}
                              disabled={!doc.filename}
                              title={doc.filename ? 'Download' : 'File not stored'}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Click the eye icon to preview PDFs and images, or the download icon to save the file.
                  </p>
                </Section>
              </TabsContent>

              {/* Interviews tab */}
              <TabsContent value="interviews" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Scheduled Interviews
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingInterview(null);
                      setInterviewOpen(true);
                    }}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule
                  </Button>
                </div>

                <InterviewList
                  interviews={interviews}
                  onEdit={(i) => {
                    setEditingInterview(i);
                    setInterviewOpen(true);
                  }}
                  onRefresh={refreshInterviews}
                />
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          candidateId={candidate.id}
          filename={previewDoc.filename}
          docName={previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Interview Scheduler Modal */}
      <InterviewScheduler
        open={interviewOpen}
        onOpenChange={(o) => {
          setInterviewOpen(o);
          if (!o) setEditingInterview(null);
        }}
        candidateId={candidate.id}
        candidateName={candidate.fullName}
        editing={editingInterview}
        onSaved={async () => {
          setInterviewOpen(false);
          setEditingInterview(null);
          await refreshInterviews();
        }}
      />
    </>
  );
}

/* ============ Document Preview Modal ============ */
function DocumentPreviewModal({
  candidateId,
  filename,
  docName,
  onClose,
}: {
  candidateId: string;
  filename: string;
  docName: string;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ext = docName.split('.').pop()?.toLowerCase();
  const isPDF = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const url = api.getDocumentUrl(candidateId, filename);
    const token = localStorage.getItem('ovid_auth_token');

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        setBlobUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [candidateId, filename]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${docName}`);
  };

  const handleOpenInTab = async () => {
    try {
      const url = api.getDocumentUrl(candidateId, filename);
      const token = localStorage.getItem('ovid_auth_token');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Not found');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch {
      toast.error('Failed to open document');
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="border-b px-4 py-3 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-medium truncate pr-4">
            {docName}
          </DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            {(isPDF || isImage) && (
              <Button variant="ghost" size="sm" onClick={handleOpenInTab}>
                <ExternalLink className="h-4 w-4 mr-1.5" /> Open in Tab
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!blobUrl}>
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-secondary/30">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <div className="text-muted-foreground text-sm">Loading document...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" onClick={handleOpenInTab}>
                Try Opening in New Tab
              </Button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <>
              {isPDF && (
                <iframe
                  src={blobUrl}
                  className="w-full h-full"
                  title={docName}
                />
              )}

              {isImage && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={blobUrl}
                    alt={docName}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              )}

              {!isPDF && !isImage && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p className="text-muted-foreground text-sm">
                    Preview not available for {ext?.toUpperCase()} files
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> Download to View
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Helpers ============ */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value}</span>
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
  'bg-indigo-500': 'bg-indigo-500 text-white',   // 🆕
  'bg-cyan-500': 'bg-cyan-500 text-white',
  'bg-violet-500': 'bg-violet-500 text-white',
  'bg-amber-500': 'bg-amber-500 text-white',
  'bg-lime-500': 'bg-lime-500 text-white',       // 🆕
  'bg-emerald-500': 'bg-emerald-500 text-white',
  'bg-green-600': 'bg-green-600 text-white',     // 🆕
  'bg-teal-500': 'bg-teal-500 text-white',
  'bg-rose-500': 'bg-rose-500 text-white',
};
  return map[stage.color] || 'bg-muted text-muted-foreground';
}