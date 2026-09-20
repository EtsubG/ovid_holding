// frontend/src/components/InterviewList.tsx
import { useState } from 'react';
import {
  Calendar, Clock, Video, Phone, Building2, Users, Link as LinkIcon,
  Edit, Trash2, CheckCircle2, XCircle, AlertTriangle, Star, MoreHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InterviewFeedbackModal } from '@/components/InterviewFeedbackModal';
import { cn } from '@/lib/utils';
import { api, type Interview } from '@/lib/api';
import { toast } from 'sonner';

interface InterviewListProps {
  interviews: Interview[];
  onEdit: (i: Interview) => void;
  onRefresh: () => void;
  /** Show candidate name (used in dashboard context) */
  showCandidate?: boolean;
}

export function InterviewList({
  interviews,
  onEdit,
  onRefresh,
  showCandidate = false,
}: InterviewListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Interview | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteInterview(deleteTarget.id);
      toast.success('Interview deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ✅ Direct status change (for cancel / no-show)
  const handleStatusChange = async (interview: Interview, newStatus: string) => {
    try {
      await api.updateInterview(interview.id, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      onRefresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  // ✅ Open feedback modal (for Completed)
  const handleMarkCompleted = (interview: Interview) => {
    setFeedbackTarget(interview);
  };

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
        <Calendar className="mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            showCandidate={showCandidate}
            onEdit={() => onEdit(interview)}
            onDelete={() => setDeleteTarget(interview)}
            onStatusChange={(s) => handleStatusChange(interview, s)}
            onMarkCompleted={() => handleMarkCompleted(interview)}
          />
        ))}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete interview?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the interview{' '}
              <strong>"{deleteTarget?.title}"</strong> scheduled for{' '}
              {deleteTarget && new Date(deleteTarget.scheduledDate).toLocaleString('en-GB')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback modal */}
      <InterviewFeedbackModal
        open={!!feedbackTarget}
        onOpenChange={(o) => !o && setFeedbackTarget(null)}
        interview={feedbackTarget}
        onSaved={() => {
          setFeedbackTarget(null);
          onRefresh();
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Individual interview card
// ─────────────────────────────────────────────
function InterviewCard({
  interview,
  showCandidate,
  onEdit,
  onDelete,
  onStatusChange,
  onMarkCompleted,
}: {
  interview: Interview;
  showCandidate: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: string) => void;
  onMarkCompleted: () => void;
}) {
  const dt = new Date(interview.scheduledDate);
  const isPast = dt < new Date();
  const isUpcoming =
    !isPast && interview.status === 'Scheduled' &&
    (dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 7;

  const typeIcons: Record<string, typeof Video> = {
    Phone: Phone,
    Video: Video,
    'In-Person': Building2,
    Technical: Users,
    Behavioral: Users,
    Final: CheckCircle2,
  };
  const Icon = typeIcons[interview.type] || Video;

  const statusStyles: Record<string, string> = {
    Scheduled: 'bg-blue-500',
    Completed: 'bg-emerald-500',
    Cancelled: 'bg-rose-500',
    Rescheduled: 'bg-amber-500',
    'No-Show': 'bg-slate-500',
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:border-accent/40',
        isUpcoming && 'border-accent/60 bg-accent/5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-medium">{interview.title}</h3>
              {showCandidate && interview.candidate && (
                <p className="truncate text-xs text-muted-foreground">
                  {interview.candidate.fullName}
                  {interview.candidate.vacancy && ` · ${interview.candidate.vacancy.title}`}
                </p>
              )}
            </div>
            <Badge
              className={cn(
                'border-transparent text-white font-normal ml-auto',
                statusStyles[interview.status]
              )}
            >
              {interview.status}
            </Badge>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {dt.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {dt.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                · {interview.duration} min
              </span>
            </div>
            {interview.interviewerName && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{interview.interviewerName}</span>
              </div>
            )}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-accent hover:underline truncate"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="truncate">{interview.meetingLink}</span>
              </a>
            )}
            {interview.location && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{interview.location}</span>
              </div>
            )}
          </div>

          {interview.notes && (
            <p className="mt-3 border-t border-border/50 pt-2 text-xs text-muted-foreground">
              {interview.notes}
            </p>
          )}

          {interview.rating && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Rating:</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < interview.rating!
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {interview.status === 'Scheduled' && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onMarkCompleted}>
      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
      Mark as Completed & Add Feedback
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onStatusChange('Cancelled')}>
      <XCircle className="mr-2 h-4 w-4 text-rose-600" />
      Cancel Interview
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onStatusChange('No-Show')}>
      <AlertTriangle className="mr-2 h-4 w-4 text-slate-600" />
      Mark as No-Show
    </DropdownMenuItem>
  </>
)}

{/* Add: Edit feedback for completed interviews */}
{interview.status === 'Completed' && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onMarkCompleted}>
      <Star className="mr-2 h-4 w-4 text-amber-600" />
      Edit Feedback
    </DropdownMenuItem>
  </>
)}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}