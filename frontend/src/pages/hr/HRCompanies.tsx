// frontend/src/pages/hr/HRCompanies.tsx
import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Building2, MapPin, Users, Calendar,
  Loader2, AlertTriangle, Inbox, X, CheckCircle2,
} from 'lucide-react';
import { api, type CompanyInput } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  industry: string;
  location: string;
  employees: string;
  founded: string;
  accent: string;
  icon: string;
}

// Preset accent options
const accentOptions = [
  { value: 'from-amber-500/20 to-amber-700/10', label: 'Amber' },
  { value: 'from-rose-500/20 to-rose-700/10', label: 'Rose' },
  { value: 'from-emerald-500/20 to-emerald-700/10', label: 'Emerald' },
  { value: 'from-sky-500/20 to-sky-700/10', label: 'Sky' },
  { value: 'from-violet-500/20 to-violet-700/10', label: 'Violet' },
  { value: 'from-teal-500/20 to-teal-700/10', label: 'Teal' },
  { value: 'from-indigo-500/20 to-indigo-700/10', label: 'Indigo' },
  { value: 'from-orange-500/20 to-orange-700/10', label: 'Orange' },
];

// Preset icon options
const iconOptions = [
  'Building2', 'Hotel', 'TrendingUp', 'HardHat', 'Cpu', 'ShoppingBag',
  'Plane', 'Car', 'Heart', 'Star', 'Users', 'Briefcase', 'Zap', 'Truck',
];

export function HRCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleteCheck, setDeleteCheck] = useState<any>(null);
  const [checkingDelete, setCheckingDelete] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data as Company[]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    setEditorOpen(true);
  };

  const openDeleteDialog = async (c: Company) => {
    setDeleteTarget(c);
    setCheckingDelete(true);
    setDeleteCheck(null);
    try {
      const check = await api.checkCompanyDeletion(c.id);
      setDeleteCheck(check);
    } catch (error) {
      console.error(error);
      toast.error('Failed to check company');
    } finally {
      setCheckingDelete(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteCompany(deleteTarget.id);
      toast.success('Company deleted');
      setDeleteTarget(null);
      setDeleteCheck(null);
      loadCompanies();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to delete company');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Company Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage all Ovid Holding subsidiaries.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Company
        </Button>
      </div>

      {/* Stat */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-accent" />
          <div>
            <div className="font-serif text-2xl font-semibold">{companies.length}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Companies
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {companies.length} shown
            </span>
            <button
              onClick={() => setSearch('')}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        )}
      </Card>

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No companies found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {companies.length === 0
              ? 'Create your first company to get started.'
              : 'Try a different search.'}
          </p>
          {companies.length === 0 && (
            <Button
              onClick={openCreate}
              className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Company
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              onEdit={() => openEdit(c)}
              onDelete={() => openDeleteDialog(c)}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <CompanyEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        onSaved={() => {
          setEditorOpen(false);
          loadCompanies();
        }}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteTarget(null);
            setDeleteCheck(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {checkingDelete && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking for related data...
            </div>
          )}

          {!checkingDelete && deleteCheck && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
              {deleteCheck.canDelete ? (
                <div className="flex items-start gap-2 text-emerald-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    This company has no active vacancies or candidates. Safe to delete.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      Cannot delete this company
                    </span>
                  </div>
                  <ul className="ml-6 mt-2 list-disc space-y-1 text-xs text-muted-foreground">
                    {deleteCheck.activeVacancies > 0 && (
                      <li>{deleteCheck.activeVacancies} active vacancies</li>
                    )}
                    {deleteCheck.candidates > 0 && (
                      <li>{deleteCheck.candidates} candidate records</li>
                    )}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Delete or unpublish these first.
                  </p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!deleteCheck?.canDelete}
              className={cn(
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                !deleteCheck?.canDelete && 'opacity-50 cursor-not-allowed'
              )}
            >
              Delete Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// Company card
// ─────────────────────────────────────────────
function CompanyCard({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:border-accent/40 hover:shadow-lg">
      {/* Accent header */}
      <div className={cn('relative h-20 bg-gradient-to-br', company.accent)}>
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <Building2 className="h-7 w-7 text-primary/40" />
          <span className="font-serif text-3xl font-semibold text-primary/30">
            {company.shortName}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold">{company.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {company.tagline}
        </p>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3" />
            <span>{company.industry}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>{company.employees} employees</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>Founded {company.founded}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <code className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            {company.id}
          </code>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Editor modal
// ─────────────────────────────────────────────
function CompanyEditor({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Company | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CompanyInput>({
    id: '',
    name: '',
    shortName: '',
    tagline: '',
    description: '',
    industry: '',
    location: '',
    employees: '',
    founded: '',
    accent: 'from-amber-500/20 to-amber-700/10',
    icon: 'Building2',
  });

  useEffect(() => {
    if (open && editing) {
      setForm({
        id: editing.id,
        name: editing.name,
        shortName: editing.shortName,
        tagline: editing.tagline,
        description: editing.description,
        industry: editing.industry,
        location: editing.location,
        employees: editing.employees,
        founded: editing.founded,
        accent: editing.accent,
        icon: editing.icon,
      });
      setFieldErrors({});
    } else if (open && !editing) {
      setForm({
        id: '',
        name: '',
        shortName: '',
        tagline: '',
        description: '',
        industry: '',
        location: '',
        employees: '',
        founded: new Date().getFullYear().toString(),
        accent: 'from-amber-500/20 to-amber-700/10',
        icon: 'Building2',
      });
      setFieldErrors({});
    }
  }, [open, editing]);

  const set = <K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((p) => ({ ...p, [key as string]: '' }));
    }
  };

  // Auto-generate ID from name if creating
  const handleNameChange = (name: string) => {
    set('name', name);
    if (!editing && name) {
      const generated = 'ovid-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      set('id', generated);
    }
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    if (!form.id || form.id.length < 3) {
      errors.id = 'ID must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(form.id)) {
      errors.id = 'ID must only contain lowercase letters, numbers, and hyphens';
    }
    if (!form.name || form.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    if (!form.shortName || form.shortName.length < 2) {
      errors.shortName = 'Short name must be at least 2 characters';
    }
    if (!form.tagline || form.tagline.length < 5) {
      errors.tagline = 'Tagline must be at least 5 characters';
    }
    if (!form.description || form.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    if (!form.industry) errors.industry = 'Industry is required';
    if (!form.location) errors.location = 'Location is required';
    if (!form.employees) errors.employees = 'Employees is required';
    if (!form.founded) errors.founded = 'Founded year is required';

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        const { id, ...updates } = form;
        await api.updateCompany(editing.id, updates);
        toast.success('Company updated');
      } else {
        await api.createCompany(form);
        toast.success('Company created');
      }
      onSaved();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Company' : 'Create New Company'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Editing "${editing.name}"`
              : 'Add a new subsidiary to the Ovid Holding group.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Identity */}
          <section className="space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Identity
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Ovid Aerospace"
                  className={fieldErrors.name ? 'border-destructive' : ''}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  ID (URL slug) <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.id}
                  onChange={(e) => set('id', e.target.value)}
                  placeholder="e.g. ovid-aerospace"
                  disabled={!!editing}
                  className={cn(
                    'font-mono text-sm',
                    fieldErrors.id && 'border-destructive',
                    editing && 'bg-muted'
                  )}
                />
                {fieldErrors.id && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.id}</p>
                )}
                {!editing && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Auto-generated from name. Lowercase letters, numbers, hyphens only.
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Short Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.shortName}
                  onChange={(e) => set('shortName', e.target.value.toUpperCase())}
                  placeholder="e.g. OAS"
                  maxLength={10}
                  className={fieldErrors.shortName ? 'border-destructive' : ''}
                />
                {fieldErrors.shortName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.shortName}</p>
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
                Tagline <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g. Next-generation aviation solutions"
                maxLength={200}
                className={fieldErrors.tagline ? 'border-destructive' : ''}
              />
              {fieldErrors.tagline && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.tagline}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 block">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Full description of the company..."
                className={cn('min-h-[100px]', fieldErrors.description && 'border-destructive')}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
              )}
            </div>
          </section>

          {/* Details */}
          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  placeholder="e.g. Aerospace & Defense"
                  className={fieldErrors.industry ? 'border-destructive' : ''}
                />
                {fieldErrors.industry && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.industry}</p>
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
                <Label className="mb-1.5 block">
                  Employees <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.employees}
                  onChange={(e) => set('employees', e.target.value)}
                  placeholder="e.g. 150+"
                  className={fieldErrors.employees ? 'border-destructive' : ''}
                />
                {fieldErrors.employees && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.employees}</p>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">
                  Founded Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.founded}
                  onChange={(e) => set('founded', e.target.value)}
                  placeholder="e.g. 2020"
                  maxLength={10}
                  className={fieldErrors.founded ? 'border-destructive' : ''}
                />
                {fieldErrors.founded && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.founded}</p>
                )}
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h3>

            <div>
              <Label className="mb-2 block">Accent Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {accentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('accent', opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all',
                      form.accent === opt.value
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-border hover:border-accent/40'
                    )}
                  >
                    <div className={cn('h-6 w-full rounded bg-gradient-to-br', opt.value)} />
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => set('icon', iconName)}
                    className={cn(
                      'rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                      form.icon === iconName
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-border hover:border-accent/40'
                    )}
                  >
                    {iconName}
                  </button>
                ))}
              </div>
            </div>
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
              'Create Company'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}