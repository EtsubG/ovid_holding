// frontend/src/pages/hr/HRVacancies.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff, Star, MoreHorizontal,
  Building2, MapPin, Briefcase, Calendar, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Filter, X, Inbox, Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDate } from '@/lib/data';

interface Vacancy {
  id: string;
  title: string;
  companyId: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  experienceYears: string;
  salaryRange: string;
  postedDate: string;
  closingDate: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  documents: string[];
  featured: boolean;
  isActive: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  company?: { id: string; name: string; shortName: string };
}

interface Company {
  id: string;
  name: string;
  shortName: string;
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export function HRVacancies() {
  const { user, isManagement, canCreateVacancy, canWrite, isCompanyHR } = useAuth();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacancy | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vacanciesData, companiesData, departmentsData] = await Promise.all([
        api.getAllVacanciesAdmin(),
        api.getCompanies(),
        api.getDepartments(),
      ]);
      setVacancies(vacanciesData);
      setCompanies(companiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load vacancies:', error);
      toast.error('Failed to load vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.title.toLowerCase().includes(q) &&
          !v.department.toLowerCase().includes(q) &&
          !v.location.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (companyFilter !== 'all' && v.companyId !== companyFilter) return false;
      if (statusFilter === 'active' && !v.isActive) return false;
      if (statusFilter === 'inactive' && v.isActive) return false;
      if (statusFilter === 'featured' && !v.featured) return false;
      if (statusFilter === 'closing') {
        const daysLeft =
          (new Date(v.closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysLeft > 7 || daysLeft < 0) return false;
      }
      if (approvalFilter !== 'all' && v.approvalStatus !== approvalFilter) return false;
      return true;
    });
  }, [vacancies, search, companyFilter, statusFilter, approvalFilter]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (v: Vacancy) => {
    setEditing(v);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteVacancy(deleteTarget.id);
      toast.success('Vacancy deleted');
      setDeleteTarget(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete vacancy');
    }
  };

  const handleToggleActive = async (v: Vacancy) => {
    try {
      const res = await api.toggleVacancyActive(v.id);
      toast.success(res.message || 'Updated');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    }
  };

  const handleToggleFeatured = async (v: Vacancy) => {
    try {
      const res = await api.toggleVacancyFeatured(v.id);
      toast.success(res.message || 'Updated');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update');
    }
  };

  const handleSubmitForApproval = async (v: Vacancy) => {
    try {
      await api.submitVacancyForApproval(v.id);
      toast.success('Submitted for approval');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit for approval');
    }
  };

  // Company HR sees only their company
  const visibleCompanies = useMemo(() => {
    if (isCompanyHR && user?.companyId) {
      return companies.filter((c) => c.id === user.companyId);
    }
    return companies;
  }, [companies, isCompanyHR, user]);

  const activeCount = vacancies.filter((v) => v.isActive).length;
  const draftCount = vacancies.filter((v) => !v.isActive).length;
  const featuredCount = vacancies.filter((v) => v.featured).length;
  const pendingCount = vacancies.filter((v) => v.approvalStatus === 'Pending').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Vacancy Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isManagement
              ? 'View open positions across the group.'
              : 'Create, publish, and manage job openings across all companies.'}
          </p>
        </div>

        {canCreateVacancy && (
          <Button
            onClick={openCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Vacancy
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total" value={vacancies.length} />
        <StatCard label="Published" value={activeCount} tone="emerald" />
        <StatCard label="Drafts" value={draftCount} tone="amber" />
        <StatCard label="Pending Approval" value={pendingCount} tone="amber" />
        <StatCard label="Featured" value={featuredCount} tone="violet" />
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, department, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Company filter — hidden for company_hr */}
          {!isCompanyHR && (
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <Building2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger>
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Approvals</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Published only</SelectItem>
              <SelectItem value="inactive">Drafts only</SelectItem>
              <SelectItem value="featured">Featured only</SelectItem>
              <SelectItem value="closing">Closing this week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || companyFilter !== 'all' || statusFilter !== 'all' || approvalFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {vacancies.length} shown
            </span>
            <button
              onClick={() => {
                setSearch('');
                setCompanyFilter('all');
                setStatusFilter('all');
                setApprovalFilter('all');
              }}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No vacancies found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {vacancies.length === 0
              ? isManagement
                ? 'No vacancies have been created yet.'
                : 'Create your first vacancy to get started.'
              : 'Try adjusting your filters.'}
          </p>
          {canCreateVacancy && (
            <Button
              onClick={openCreate}
              className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Vacancy
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <VacancyRow
              key={v.id}
              vacancy={v}
              canWrite={canWrite}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              onSubmitForApproval={handleSubmitForApproval}
            />
          ))}
        </div>
      )}

      {/* Editor modal */}
      {canCreateVacancy && (
        <VacancyEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editing={editing}
          companies={visibleCompanies}
          departments={departments}
          defaultCompanyId={user?.companyId ?? undefined}
          onSaved={() => {
            setEditorOpen(false);
            loadData();
          }}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete vacancy?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
              This action cannot be undone.
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
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'emerald' | 'amber' | 'violet';
}) {
  const tones: Record<string, string> = {
    default: 'text-foreground',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    violet: 'text-violet-600',
  };
  return (
    <Card className="p-4">
      <div className={cn('font-serif text-2xl font-semibold', tones[tone])}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Row
// ─────────────────────────────────────────────
function VacancyRow({
  vacancy,
  canWrite,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onSubmitForApproval,
}: {
  vacancy: Vacancy;
  canWrite: boolean;
  onEdit: (v: Vacancy) => void;
  onDelete: (v: Vacancy) => void;
  onToggleActive: (v: Vacancy) => void;
  onToggleFeatured: (v: Vacancy) => void;
  onSubmitForApproval: (v: Vacancy) => void;
}) {
  const daysLeft = Math.ceil(
    (new Date(vacancy.closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const closingSoon = daysLeft >= 0 && daysLeft <= 7;

  return (
    <Card
      className={cn(
        'p-5 transition-all hover:border-accent/40',
        !vacancy.isActive && 'opacity-70'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-serif text-xs font-semibold">
              {vacancy.company?.shortName || '?'}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {vacancy.company?.name || vacancy.companyId}
              </p>
              <p className="text-xs text-muted-foreground/70">{vacancy.department}</p>
            </div>
          </div>

          <h3 className="mt-3 font-serif text-lg font-semibold">{vacancy.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {vacancy.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal">
              <MapPin className="mr-1 h-3 w-3" /> {vacancy.location}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              <Briefcase className="mr-1 h-3 w-3" /> {vacancy.type}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              <Calendar className="mr-1 h-3 w-3" /> Closes {formatDate(vacancy.closingDate)}
            </Badge>
          </div>

          {vacancy.approvalStatus === 'Rejected' && vacancy.rejectionReason && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span className="text-rose-600">
                <strong>Rejected:</strong> {vacancy.rejectionReason}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status badges */}
          <div className="flex flex-wrap justify-end gap-1.5">
            {/* Approval status */}
            {vacancy.approvalStatus === 'Pending' && (
              <Badge className="border-transparent bg-amber-500 text-white font-normal">
                <Clock className="mr-1 h-3 w-3" /> Pending Approval
              </Badge>
            )}
            {vacancy.approvalStatus === 'Rejected' && (
              <Badge className="border-transparent bg-rose-500 text-white font-normal">
                <XCircle className="mr-1 h-3 w-3" /> Rejected
              </Badge>
            )}
            {vacancy.approvalStatus === 'Approved' && (
              <Badge className="border-transparent bg-emerald-500 text-white font-normal">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
              </Badge>
            )}

            {/* Publishing status */}
            {vacancy.isActive && (
              <Badge className="border-transparent bg-emerald-600 text-white font-normal">
                <Eye className="mr-1 h-3 w-3" /> Published
              </Badge>
            )}

            {vacancy.featured && (
              <Badge className="border-transparent bg-violet-500 text-white font-normal">
                <Star className="mr-1 h-3 w-3" /> Featured
              </Badge>
            )}

            {closingSoon && (
              <Badge className="border-transparent bg-destructive text-destructive-foreground font-normal">
                Closing in {daysLeft}d
              </Badge>
            )}
          </div>

          {/* Actions — hidden for management */}
          {canWrite && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => onEdit(vacancy)}>
                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Submit for approval */}
                  {vacancy.approvalStatus !== 'Approved' && (
                    <DropdownMenuItem onClick={() => onSubmitForApproval(vacancy)}>
                      <Clock className="mr-2 h-4 w-4 text-amber-600" />
                      Submit for Approval
                    </DropdownMenuItem>
                  )}

                  {/* Publish/unpublish */}
                  <DropdownMenuItem onClick={() => onToggleActive(vacancy)}>
                    {vacancy.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" /> Publish
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onToggleFeatured(vacancy)}>
                    <Star className="mr-2 h-4 w-4" />
                    {vacancy.featured ? 'Remove from featured' : 'Mark as featured'}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(vacancy)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Editor modal (create / edit)
// ─────────────────────────────────────────────
function VacancyEditor({
  open,
  onOpenChange,
  editing,
  companies,
  departments,
  defaultCompanyId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Vacancy | null;
  companies: Company[];
  departments: string[];
  defaultCompanyId?: string;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    companyId: defaultCompanyId || '',
    department: '',
    location: '',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    experienceYears: '',
    salaryRange: '',
    closingDate: '',
    summary: '',
    description: '',
    responsibilities: '',
    requirements: '',
    preferred: '',
    documents: 'CV / Resume\nCover Letter',
    featured: false,
    isActive: false,
  });

  // Load editing data when modal opens
  useEffect(() => {
    if (open && editing) {
      setForm({
        title: editing.title,
        companyId: editing.companyId,
        department: editing.department,
        location: editing.location,
        type: editing.type,
        experienceLevel: editing.experienceLevel,
        experienceYears: editing.experienceYears,
        salaryRange: editing.salaryRange,
        closingDate: editing.closingDate.split('T')[0],
        summary: editing.summary,
        description: editing.description,
        responsibilities: (editing.responsibilities || []).join('\n'),
        requirements: (editing.requirements || []).join('\n'),
        preferred: (editing.preferred || []).join('\n'),
        documents: (editing.documents || []).join('\n'),
        featured: editing.featured,
        isActive: editing.isActive,
      });
      setFieldErrors({});
    } else if (open && !editing) {
      setForm({
        title: '',
        companyId: defaultCompanyId || companies[0]?.id || '',
        department: '',
        location: '',
        type: 'Full-time',
        experienceLevel: 'Mid Level',
        experienceYears: '',
        salaryRange: '',
        closingDate: '',
        summary: '',
        description: '',
        responsibilities: '',
        requirements: '',
        preferred: '',
        documents: 'CV / Resume\nCover Letter',
        featured: false,
        isActive: false,
      });
      setFieldErrors({});
    }
  }, [open, editing, companies, defaultCompanyId]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((p) => ({ ...p, [key as string]: '' }));
    }
  };

  const handleSave = async () => {
    // Detailed validation
    const errors: Record<string, string> = {};

    if (!form.title || form.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!form.companyId) {
      errors.companyId = 'Please select a company';
    }
    if (!form.department?.trim()) {
      errors.department = 'Department is required';
    }
    if (!form.location?.trim()) {
      errors.location = 'Location is required';
    }
    if (!form.experienceYears?.trim()) {
      errors.experienceYears = 'Years of experience is required';
    }
    if (!form.salaryRange?.trim()) {
      errors.salaryRange = 'Salary range is required';
    }
    if (!form.closingDate) {
      errors.closingDate = 'Closing date is required';
    } else if (new Date(form.closingDate) < new Date()) {
      errors.closingDate = 'Closing date must be in the future';
    }
    if (!form.summary?.trim()) {
      errors.summary = 'Summary is required';
    } else if (form.summary.trim().length < 20) {
      errors.summary = `Summary must be at least 20 characters (currently ${form.summary.trim().length})`;
    }
    if (!form.description?.trim()) {
      errors.description = 'Description is required';
    } else if (form.description.trim().length < 20) {
      errors.description = `Description must be at least 20 characters (currently ${form.description.trim().length})`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields', { duration: 5000 });
      return;
    }

    const splitLines = (s: string) =>
      s.split('\n').map((l) => l.trim()).filter(Boolean);

    const payload = {
      title: form.title.trim(),
      companyId: form.companyId,
      department: form.department.trim(),
      location: form.location.trim(),
      type: form.type,
      experienceLevel: form.experienceLevel,
      experienceYears: form.experienceYears.trim(),
      salaryRange: form.salaryRange.trim(),
      closingDate: new Date(form.closingDate).toISOString(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      responsibilities: splitLines(form.responsibilities),
      requirements: splitLines(form.requirements),
      preferred: splitLines(form.preferred),
      documents: splitLines(form.documents),
      featured: form.featured,
      isActive: false,   // always start as draft — approval required
    };

    try {
      setSaving(true);
      if (editing) {
        await api.updateVacancy(editing.id, payload);
        toast.success('Vacancy updated');
      } else {
        await api.createVacancy(payload);
        toast.success('Vacancy created — pending approval');
      }
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save', {
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Vacancy' : 'Create New Vacancy'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Editing "${editing.title}"`
              : 'Fill in the details below. New vacancies require approval before publishing.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Basic info */}
          <section className="space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Basic Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className={fieldErrors.title ? 'border-destructive' : ''}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Select value={form.companyId} onValueChange={(v) => set('companyId', v)}>
                  <SelectTrigger className={fieldErrors.companyId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.companyId && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.companyId}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select value={form.department} onValueChange={(v) => set('department', v)}>
                  <SelectTrigger className={fieldErrors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.department && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.department}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Dubai, UAE"
                  className={fieldErrors.location ? 'border-destructive' : ''}
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.location}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">Employment Type</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Select
                  value={form.experienceLevel}
                  onValueChange={(v) => set('experienceLevel', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Label className="mb-1.5 block">
                  Years of Experience <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.experienceYears}
                  onChange={(e) => set('experienceYears', e.target.value)}
                  placeholder="e.g. 5+ years"
                  className={fieldErrors.experienceYears ? 'border-destructive' : ''}
                />
                {fieldErrors.experienceYears && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.experienceYears}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Salary Range <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.salaryRange}
                  onChange={(e) => set('salaryRange', e.target.value)}
                  placeholder="e.g. AED 25,000 - 35,000 / mo"
                  className={fieldErrors.salaryRange ? 'border-destructive' : ''}
                />
                {fieldErrors.salaryRange && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.salaryRange}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Closing Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.closingDate}
                  onChange={(e) => set('closingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={fieldErrors.closingDate ? 'border-destructive' : ''}
                />
                {fieldErrors.closingDate && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.closingDate}</p>
                )}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </h3>

            <div>
              <Label className="mb-1.5 block">
                Summary <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
                placeholder="Short 1-2 sentence summary for the job card..."
                className={`min-h-[60px] ${fieldErrors.summary ? 'border-destructive' : ''}`}
                maxLength={500}
              />
              {fieldErrors.summary ? (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.summary}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.summary.length} / 500 (min 20)
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 block">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Full role description shown on the vacancy page..."
                className={`min-h-[120px] ${fieldErrors.description ? 'border-destructive' : ''}`}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Responsibilities (one per line)</Label>
                <Textarea
                  value={form.responsibilities}
                  onChange={(e) => set('responsibilities', e.target.value)}
                  placeholder={'Lead the team\nDesign new features\nMentor juniors'}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Requirements (one per line)</Label>
                <Textarea
                  value={form.requirements}
                  onChange={(e) => set('requirements', e.target.value)}
                  placeholder={"Bachelor's degree\n5+ years experience\nStrong communication"}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Preferred (one per line)</Label>
                <Textarea
                  value={form.preferred}
                  onChange={(e) => set('preferred', e.target.value)}
                  placeholder={'MBA\nBilingual Arabic/English'}
                  className="min-h-[100px] font-mono text-xs"
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Required Documents (one per line)</Label>
                <Textarea
                  value={form.documents}
                  onChange={(e) => set('documents', e.target.value)}
                  placeholder={'CV / Resume\nCover Letter\nCertificates'}
                  className="min-h-[100px] font-mono text-xs"
                />
              </div>
            </div>
          </section>

          {/* Flags */}
          <section className="space-y-3 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Publishing
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Feature on homepage</span>
            </label>
            <p className="text-xs text-muted-foreground">
              New vacancies start as <strong>drafts pending approval</strong>. You'll be able to publish once approved.
            </p>
          </section>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={saving}>
              Cancel
            </Button>
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
              'Create Vacancy'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}