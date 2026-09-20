// frontend/src/components/InterviewScheduler.tsx
import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, Phone, Users, Building2, Link as LinkIcon,
  Loader2, Check, AlertCircle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api, type Interview } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InterviewSchedulerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidateId: string;
  candidateName: string;
  /** If provided, the scheduler opens in edit mode */
  editing?: Interview | null;
  onSaved: () => void;
}

const interviewTypes = [
  { value: 'Phone', label: 'Phone Screening', icon: Phone },
  { value: 'Video', label: 'Video Call', icon: Video },
  { value: 'In-Person', label: 'In-Person', icon: Building2 },
  { value: 'Technical', label: 'Technical Interview', icon: Users },
  { value: 'Behavioral', label: 'Behavioral Interview', icon: Users },
  { value: 'Final', label: 'Final Interview', icon: Check },
];

export function InterviewScheduler({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  editing,
  onSaved,
}: InterviewSchedulerProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Video',
    date: '',
    time: '',
    duration: '60',
    location: '',
    meetingLink: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: '',
  });

  // Load editing data
  useEffect(() => {
    if (open && editing) {
      const dt = new Date(editing.scheduledDate);
      const date = dt.toISOString().split('T')[0];
      const hours = String(dt.getHours()).padStart(2, '0');
      const minutes = String(dt.getMinutes()).padStart(2, '0');

      setForm({
        title: editing.title,
        type: editing.type,
        date,
        time: `${hours}:${minutes}`,
        duration: String(editing.duration || 60),
        location: editing.location || '',
        meetingLink: editing.meetingLink || '',
        interviewerName: editing.interviewerName || '',
        interviewerEmail: editing.interviewerEmail || '',
        notes: editing.notes || '',
      });
    } else if (open && !editing) {
      // Default: tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      setForm({
        title: 'Interview',
        type: 'Video',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        duration: '60',
        location: '',
        meetingLink: '',
        interviewerName: '',
        interviewerEmail: '',
        notes: '',
      });
    }
  }, [open, editing]);

  const set = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!form.title.trim()) {
      toast.error('Interview title is required');
      return;
    }
    if (!form.date) {
      toast.error('Date is required');
      return;
    }
    if (!form.time) {
      toast.error('Time is required');
      return;
    }

    // Build ISO datetime
    const [hours, minutes] = form.time.split(':').map(Number);
    const scheduledDate = new Date(form.date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate < new Date()) {
      toast.error('Interview date must be in the future');
      return;
    }

    const payload = {
      candidateId,
      title: form.title.trim(),
      type: form.type,
      scheduledDate: scheduledDate.toISOString(),
      duration: parseInt(form.duration, 10) || 60,
      location: form.location.trim() || undefined,
      meetingLink: form.meetingLink.trim() || undefined,
      interviewerName: form.interviewerName.trim() || undefined,
      interviewerEmail: form.interviewerEmail.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSaving(true);
      if (editing) {
        await api.updateInterview(editing.id, payload);
        toast.success('Interview updated');
      } else {
        await api.createInterview(payload);
        toast.success('Interview scheduled');
      }
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const selectedType = interviewTypes.find((t) => t.value === form.type);
  const Icon = selectedType?.icon ?? Video;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Interview' : 'Schedule Interview'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Updating interview for ${candidateName}`
              : `Schedule an interview with ${candidateName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Title + Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">
                Interview Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Technical Interview - Round 1"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Interview Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger>
                  <Icon className="mr-1.5 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((t) => {
                    const I = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <I className="h-3.5 w-3.5" />
                          {t.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Duration (minutes)</Label>
              <Select value={form.duration} onValueChange={(v) => set('duration', v)}>
                <SelectTrigger>
                  <Clock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">
                Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">
                Time <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Location / Link based on type */}
          <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-5">
            {(form.type === 'In-Person' || form.type === 'Technical' || form.type === 'Final') && (
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Location</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Ovid Holding HQ, Meeting Room 3"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {(form.type === 'Video' || form.type === 'Phone') && (
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  {form.type === 'Video' ? 'Meeting Link' : 'Call Number'}
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.meetingLink}
                    onChange={(e) => set('meetingLink', e.target.value)}
                    placeholder={
                      form.type === 'Video'
                        ? 'e.g. https://meet.google.com/abc-defg-hij'
                        : 'e.g. +971 4 555 8800'
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="mb-1.5 block">Interviewer Name</Label>
              <Input
                value={form.interviewerName}
                onChange={(e) => set('interviewerName', e.target.value)}
                placeholder="e.g. Sarah Ahmed"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Interviewer Email</Label>
              <Input
                type="email"
                value={form.interviewerEmail}
                onChange={(e) => set('interviewerEmail', e.target.value)}
                placeholder="e.g. sarah@ovidholding.com"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-border pt-5">
            <Label className="mb-1.5 block">Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any preparation notes, focus areas, or instructions..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={saving}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : editing ? (
              'Save Changes'
            ) : (
              'Schedule Interview'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}