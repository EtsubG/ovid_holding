// frontend/src/pages/hr/HRVacancyApprovals.tsx
import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, Building2, MapPin, Briefcase,
  Calendar, AlertTriangle, Loader2, Inbox, FileText, Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Vacancy {
  id: string;
  title: string;
  companyId: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  salaryRange: string;
  closingDate: string;
  summary: string;
  description: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  company?: { id: string; name: string; shortName: string };
  createdAt: string;
}

export function HRVacancyApprovals() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [approveTarget, setApproveTarget] = useState<Vacancy | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Vacancy | null>(null);
  const [viewTarget, setViewTarget] = useState<Vacancy | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingApprovals();
      setVacancies(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      setSaving(true);
      await api.approveVacancy(approveTarget.id, notes);
      toast.success(`"${approveTarget.title}" approved`);
      setApproveTarget(null);
      setNotes('');
      loadPending();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }
    try {
      setSaving(true);
      await api.rejectVacancy(rejectTarget.id, reason.trim());
      toast.success(`"${rejectTarget.title}" rejected`);
      setRejectTarget(null);
      setReason('');
      loadPending();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Vacancy Approvals
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve vacancy submissions from HR team members.
        </p>
      </div>

      {/* Stat */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-500" />
          <div>
            <div className="font-serif text-2xl font-semibold">{vacancies.length}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Pending Approval
            </div>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No pending approvals</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            All caught up! New vacancy submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vacancies.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-serif text-xs font-semibold">
                      {v.company?.shortName || '?'}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {v.company?.name} · Submitted {formatDate(v.createdAt)}
                      </p>
                      <Badge className="mt-0.5 border-transparent bg-amber-500 text-white font-normal">
                        <Clock className="mr-1 h-3 w-3" /> Awaiting Approval
                      </Badge>
                    </div>
                  </div>

                  <h3 className="mt-3 font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {v.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      <MapPin className="mr-1 h-3 w-3" /> {v.location}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      <Briefcase className="mr-1 h-3 w-3" /> {v.type}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      <Calendar className="mr-1 h-3 w-3" /> Closes {formatDate(v.closingDate)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewTarget(v)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setApproveTarget(v);
                      setNotes('');
                    }}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setRejectTarget(v);
                      setReason('');
                    }}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Approve Vacancy?
            </DialogTitle>
            <DialogDescription>
              Approving <strong>{approveTarget?.title}</strong> will allow HR to publish it
              to the public careers portal.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="mb-1.5 block text-sm font-medium">
              Approval Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for the HR team..."
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleApprove}
              disabled={saving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve & Unlock Publishing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Reject Vacancy?
            </DialogTitle>
            <DialogDescription>
              The HR team will see your reason for rejecting{' '}
              <strong>{rejectTarget?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="mb-1.5 block text-sm font-medium">
              Reason for Rejection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this vacancy is being rejected (min 10 characters)..."
              className="min-h-[100px]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {reason.length} / 500 characters
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleReject}
              disabled={saving || reason.trim().length < 10}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Vacancy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{viewTarget?.title}</DialogTitle>
            <DialogDescription>
              {viewTarget?.company?.name} · {viewTarget?.department}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <h4 className="mb-1 text-sm font-semibold">Summary</h4>
              <p className="text-sm text-muted-foreground">{viewTarget?.summary}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {viewTarget?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}