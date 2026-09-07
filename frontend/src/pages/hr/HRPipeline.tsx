import { useMemo, useState } from 'react';
import { GripVertical, MoreHorizontal, User, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { pipelineStages, getCompany, getVacancy, type ApplicationStatus } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function HRPipeline() {
  const { candidates, updateCandidateStatus, setSelectedCandidateId } = useApp();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStatus | null>(null);

  const columns = useMemo(
    () => pipelineStages.map((stage) => ({
      ...stage,
      candidates: candidates.filter((c) => c.status === stage.key),
    })),
    [candidates]
  );

  const handleDrop = (status: ApplicationStatus) => {
    if (draggedId) {
      const candidate = candidates.find((c) => c.id === draggedId);
      if (candidate && candidate.status !== status) {
        updateCandidateStatus(draggedId, status);
        toast.success(`${candidate.fullName} moved to "${pipelineStages.find((s) => s.key === status)?.label}"`);
      }
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Recruitment Pipeline</h1>
        <p className="mt-1 text-muted-foreground">
          Drag and drop candidates between stages, or use the menu to update status.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(col.key); }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(col.key)}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-xl border bg-secondary/20 transition-colors',
              dragOverStage === col.key ? 'border-accent bg-accent/5' : 'border-border/60'
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className={cn('h-2.5 w-2.5 rounded-full', col.color)} />
                <span className="text-sm font-semibold">{col.label}</span>
              </div>
              <Badge variant="secondary" className="font-normal">{col.candidates.length}</Badge>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {col.candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="mb-1.5 h-6 w-6 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/50">No candidates</p>
                </div>
              ) : (
                col.candidates.map((c) => {
                  const company = getCompany(c.preferredCompany);
                  const vacancy = c.vacancyId ? getVacancy(c.vacancyId) : undefined;
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setDraggedId(c.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                      onClick={() => setSelectedCandidateId(c.id)}
                      className={cn(
                        'group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-accent/40',
                        draggedId === c.id && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-serif text-xs font-semibold">
                            {c.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{c.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.fieldOfStudy}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="rounded p-0.5 hover:bg-secondary">
                                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Move to:</div>
                              {pipelineStages
                                .filter((s) => s.key !== c.status)
                                .map((s) => (
                                  <DropdownMenuItem
                                    key={s.key}
                                    onClick={() => {
                                      updateCandidateStatus(c.id, s.key);
                                      toast.success(`Moved to "${s.label}"`);
                                    }}
                                  >
                                    <div className={cn('mr-2 h-2 w-2 rounded-full', s.color)} />
                                    {s.label}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {(vacancy || company) && (
                        <div className="mt-2 border-t border-border/40 pt-2">
                          {vacancy && <p className="truncate text-xs font-medium">{vacancy.title}</p>}
                          {company && <p className="truncate text-xs text-muted-foreground">{company.name}</p>}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge variant="outline" className="font-normal text-[10px]">{c.totalExperience}</Badge>
                        <span className="ml-auto text-[10px] text-muted-foreground">{c.city}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
        <GripVertical className="h-4 w-4" />
        Tip: Drag cards between columns to update a candidate's stage, or click the menu icon for quick status changes.
      </div>
    </div>
  );
}