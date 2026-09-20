// frontend/src/pages/hr/HRUsers.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, UserPlus, Shield,
  Building2, Mail, CheckCircle2, XCircle, Key, Loader2, Inbox, X,
  AlertTriangle, Users as UsersIcon, Ban, Power,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  api,
  type ManagedUser,
  type UserRole,
  type CreateUserInput,
} from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

interface Company {
  id: string;
  name: string;
  shortName: string;
}

// Role definitions
const roleInfo: Record<UserRole, { label: string; color: string; description: string }> = {
  system_admin: {
    label: 'System Admin',
    color: 'bg-rose-500',
    description: 'Full access — manage companies, users, everything',
  },
  holding_hr: {
    label: 'Holding HR',
    color: 'bg-violet-500',
    description: 'Cross-company HR — approve vacancies, move candidates',
  },
  company_hr: {
    label: 'Company HR',
    color: 'bg-blue-500',
    description: 'Company-scoped HR — only their own company',
  },
  management: {
    label: 'Management',
    color: 'bg-slate-500',
    description: 'Read-only viewer — dashboards and reports',
  },
};

export function HRUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);

  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, companiesData] = await Promise.all([
        api.getAllUsers(),
        api.getCompanies(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData as Company[]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !u.fullName.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setEditorOpen(true);
  };

  const handleToggleActive = async (u: ManagedUser) => {
    try {
      const res = await api.toggleUserActive(u.id);
      toast.success(res.message);
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to toggle user');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (resetPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await api.resetUserPassword(resetTarget.id, resetPassword);
      toast.success(`Password reset for ${resetTarget.fullName}`);
      setResetTarget(null);
      setResetPassword('');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      systemAdmins: users.filter((u) => u.role === 'system_admin').length,
      holdingHR: users.filter((u) => u.role === 'holding_hr').length,
      companyHR: users.filter((u) => u.role === 'company_hr').length,
      management: users.filter((u) => u.role === 'management').length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
    };
  }, [users]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage HR team members, roles, and permissions.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <UserPlus className="mr-1.5 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="emerald" />
        <StatCard label="Inactive" value={stats.inactive} tone="rose" />
        <StatCard label="Companies with HR" value={stats.companyHR} tone="blue" />
      </div>

      {/* Role breakdown */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(Object.keys(roleInfo) as UserRole[]).map((role) => {
          const info = roleInfo[role];
          const count =
            role === 'system_admin' ? stats.systemAdmins :
            role === 'holding_hr' ? stats.holdingHR :
            role === 'company_hr' ? stats.companyHR :
            stats.management;
          return (
            <Card key={role} className="p-4">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full', info.color)} />
                <span className="text-xs font-medium">{info.label}</span>
              </div>
              <div className="mt-1 font-serif text-xl font-semibold">{count}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as any)}
          >
            <SelectTrigger>
              <Shield className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(Object.keys(roleInfo) as UserRole[]).map((role) => (
                <SelectItem key={role} value={role}>
                  {roleInfo[role].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger>
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {users.length} shown
            </span>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
                setStatusFilter('all');
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
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-serif text-xl font-semibold">No users found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length === 0
              ? 'Add your first user to get started.'
              : 'Try adjusting your filters.'}
          </p>
          <Button
            onClick={openCreate}
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="mr-1.5 h-4 w-4" /> Add User
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={u.id === currentUser?.id}
              onEdit={() => openEdit(u)}
              onDelete={() => setDeleteTarget(u)}
              onResetPassword={() => {
                setResetTarget(u);
                setResetPassword('');
              }}
              onToggleActive={() => handleToggleActive(u)}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <UserEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        companies={companies}
        onSaved={() => {
          setEditorOpen(false);
          loadData();
        }}
      />

      {/* Reset Password Modal */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-accent" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resetTarget?.fullName}</strong> ({resetTarget?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="mb-1.5 block text-sm font-medium">
              New Password <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoFocus
            />
            <p className="mt-2 text-xs text-muted-foreground">
              The user will need to use this password on next login. Share it securely.
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleResetPassword}
              disabled={resetPassword.length < 8}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>{' '}
              ({deleteTarget?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
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
  tone?: 'default' | 'emerald' | 'rose' | 'blue';
}) {
  const tones: Record<string, string> = {
    default: 'text-foreground',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    blue: 'text-blue-600',
  };
  return (
    <Card className="p-4">
      <div className={cn('font-serif text-2xl font-semibold', tones[tone])}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// User row
// ─────────────────────────────────────────────
function UserRow({
  user,
  isSelf,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleActive,
}: {
  user: ManagedUser;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onToggleActive: () => void;
}) {
  const role = roleInfo[user.role];
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <Card className={cn('p-4 transition-all hover:border-accent/40', !user.isActive && 'opacity-70')}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold text-white',
            role.color
          )}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{user.fullName}</span>
            {isSelf && (
              <Badge variant="outline" className="font-normal text-[10px]">
                You
              </Badge>
            )}
            <Badge
              className={cn('border-transparent font-normal text-white text-[10px]', role.color)}
            >
              <Shield className="mr-1 h-2.5 w-2.5" />
              {role.label}
            </Badge>
            {!user.isActive && (
              <Badge variant="destructive" className="font-normal text-[10px]">
                <Ban className="mr-1 h-2.5 w-2.5" /> Disabled
              </Badge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            {user.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {user.company.name}
              </span>
            )}
            {user.lastLogin && (
              <span>Last login: {new Date(user.lastLogin).toLocaleDateString('en-GB')}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onResetPassword}>
                <Key className="mr-2 h-4 w-4 text-accent" /> Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive} disabled={isSelf}>
                {user.isActive ? (
                  <>
                    <Ban className="mr-2 h-4 w-4 text-amber-600" /> Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4 text-emerald-600" /> Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isSelf}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Editor modal (create / edit)
// ─────────────────────────────────────────────
function UserEditor({
  open,
  onOpenChange,
  editing,
  companies,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ManagedUser | null;
  companies: Company[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'company_hr' as UserRole,
    companyId: '',
    isActive: true,
  });

  useEffect(() => {
    if (open && editing) {
      setForm({
        email: editing.email,
        password: '',
        fullName: editing.fullName,
        role: editing.role,
        companyId: editing.companyId || '',
        isActive: editing.isActive,
      });
      setFieldErrors({});
    } else if (open && !editing) {
      setForm({
        email: '',
        password: '',
        fullName: '',
        role: 'company_hr',
        companyId: companies[0]?.id || '',
        isActive: true,
      });
      setFieldErrors({});
    }
  }, [open, editing, companies]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((p) => ({ ...p, [key as string]: '' }));
    }
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Valid email is required';
    }
    if (!form.fullName || form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    if (!editing) {
      if (!form.password || form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    }
    if (form.role === 'company_hr' && !form.companyId) {
      errors.companyId = 'Company HR must be assigned to a company';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        // Update — no password, no email change
        await api.updateUser(editing.id, {
          fullName: form.fullName.trim(),
          role: form.role,
          companyId: form.role === 'company_hr' ? form.companyId : null,
          isActive: form.isActive,
        });
        toast.success('User updated');
      } else {
        // Create
        const payload: CreateUserInput = {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role,
          companyId: form.role === 'company_hr' ? form.companyId : null,
          isActive: form.isActive,
        };
        await api.createUser(payload);
        toast.success('User created');
      }
      onSaved();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleInfo = roleInfo[form.role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 scrollbar-thin">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Editing ${editing.fullName}`
              : 'Create a new HR team member account.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Account info */}
          <section className="space-y-4">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="e.g. Sarah Ahmed"
                  className={fieldErrors.fullName ? 'border-destructive' : ''}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="e.g. sarah@ovidholding.com"
                  disabled={!!editing}
                  className={cn(fieldErrors.email && 'border-destructive', editing && 'bg-muted')}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
                )}
                {editing && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed after creation
                  </p>
                )}
              </div>

              {!editing && (
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block">
                    Initial Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={fieldErrors.password ? 'border-destructive' : ''}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share this password securely with the user. They can change it after login.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Role */}
          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Role & Permissions
            </h3>

            <div>
              <Label className="mb-2 block">
                Role <span className="text-destructive">*</span>
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(roleInfo) as UserRole[]).map((role) => {
                  const info = roleInfo[role];
                  const isActive = form.role === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => set('role', role)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                        isActive
                          ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                          : 'border-border hover:border-accent/40'
                      )}
                    >
                      <div className={cn('mt-0.5 h-3 w-3 shrink-0 rounded-full', info.color)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{info.label}</div>
                        <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {info.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Company assignment (only for company_hr) */}
            {form.role === 'company_hr' && (
              <div>
                <Label className="mb-1.5 block">
                  Assigned Company <span className="text-destructive">*</span>
                </Label>
                <Select value={form.companyId} onValueChange={(v) => set('companyId', v)}>
                  <SelectTrigger className={fieldErrors.companyId ? 'border-destructive' : ''}>
                    <Building2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
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
                <p className="mt-1 text-xs text-muted-foreground">
                  This user will only see candidates and vacancies from this company.
                </p>
              </div>
            )}
          </section>

          {/* Status */}
          <section className="space-y-3 border-t border-border pt-5">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Account is active</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Inactive users cannot log in and will see "Account disabled" when they try.
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
              'Create User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}