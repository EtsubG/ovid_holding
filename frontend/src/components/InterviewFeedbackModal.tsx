// frontend/src/components/InterviewFeedbackModal.tsx
import { useState } from 'react';
import {
  Star, CheckCircle2, XCircle, HelpCircle, Loader2, Sparkles,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type Interview } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Decision = 'pass' | 'fail' | 'maybe';

interface InterviewFeedbackModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  interview: Interview | null;
  onSaved: () => void;
}

export function InterviewFeedbackModal({
  open,
  onOpenChange,
  interview,
  onSaved,
}: InterviewFeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState<Decision>('pass');
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens with a new interview
  const resetForm = () => {
    setRating(interview?.rating || 0);
    setFeedback(interview?.feedback || '');
    setDecision('pass');
  };

  const handleSave = async () => {
    if (!interview) return;

    if (rating === 0) {
      toast.error('Please rate the candidate');
      return;
    }

    if (!feedback.trim() || feedback.trim().length < 10) {
      toast.error('Please provide at least 10 characters of feedback');
      return;
    }

    try {
      setSaving(true);
      await api.updateInterview(interview.id, {
        status: 'Completed',
        rating,
        feedback: feedback.trim(),
        decision,
      });

      const decisionMessage = {
        pass: '✅ Candidate moved to Reference Check',
        fail: '❌ Candidate marked as Rejected',
        maybe: '🤔 Candidate kept Under Review',
      }[decision];

      toast.success('Feedback saved', {
        description: decisionMessage,
        duration: 5000,
      });

      onSaved();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) resetForm();
    onOpenChange(v);
  };

  if (!interview) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            Interview Feedback
          </DialogTitle>
          <DialogDescription>
            {interview.title}
            {interview.candidate && ` · ${interview.candidate.fullName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Rating */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Overall Rating <span className="text-destructive">*</span>
            </Label>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hovered || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {rating === 0
                  ? 'Not rated'
                  : ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'][rating - 1]}
              </span>
            </div>
          </div>

          {/* Feedback text */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              Feedback Notes <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Summarize the candidate's performance, strengths, weaknesses, and impressions..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {feedback.length} / 1000 characters (min 10)
            </p>
          </div>

          {/* Decision */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Recruitment Decision <span className="text-destructive">*</span>
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <DecisionCard
                active={decision === 'pass'}
                onClick={() => setDecision('pass')}
                icon={CheckCircle2}
                title="Pass"
                description="Move to Reference Check"
                tone="emerald"
              />
              <DecisionCard
                active={decision === 'maybe'}
                onClick={() => setDecision('maybe')}
                icon={HelpCircle}
                title="On Hold"
                description="Keep Under Review"
                tone="amber"
              />
              <DecisionCard
                active={decision === 'fail'}
                onClick={() => setDecision('fail')}
                icon={XCircle}
                title="Fail"
                description="Mark as Rejected"
                tone="rose"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              The candidate's status will be updated automatically based on this decision.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={saving}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving || rating === 0 || feedback.trim().length < 10}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Save Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Decision card component
// ─────────────────────────────────────────────
function DecisionCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  tone: 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    emerald: {
      active: 'border-emerald-500 bg-emerald-500/5',
      iconActive: 'text-emerald-600',
      ring: 'ring-emerald-500/30',
    },
    amber: {
      active: 'border-amber-500 bg-amber-500/5',
      iconActive: 'text-amber-600',
      ring: 'ring-amber-500/30',
    },
    rose: {
      active: 'border-rose-500 bg-rose-500/5',
      iconActive: 'text-rose-600',
      ring: 'ring-rose-500/30',
    },
  };
  const t = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all hover:border-accent/40',
        active ? cn(t.active, 'ring-2', t.ring) : 'border-border bg-background'
      )}
    >
      <Icon
        className={cn(
          'h-6 w-6',
          active ? t.iconActive : 'text-muted-foreground'
        )}
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}