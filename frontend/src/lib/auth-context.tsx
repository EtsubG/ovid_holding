// frontend/src/lib/auth-context.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'ovid_auth_token';
const USER_KEY = 'ovid_auth_user';

export type UserRole = 'system_admin' | 'holding_hr' | 'company_hr' | 'management';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  companyId: string | null;
  company?: { id: string; name: string } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  // 🆕 Role helpers
  isSystemAdmin: boolean;
  isHoldingHR: boolean;
  isCompanyHR: boolean;
  isManagement: boolean;

  // 🆕 Combined permissions
  canManageAllCompanies: boolean;   // system_admin OR holding_hr
  canWrite: boolean;                // any role except management
  canManageUsers: boolean;          // system_admin only
  canApproveVacancies: boolean;     // system_admin OR holding_hr
  canCreateVacancy: boolean;        // system_admin, holding_hr, company_hr
  canViewDashboard: boolean;        // all roles

  // 🆕 Scope helpers
  getCompanyFilter: () => string | null;   // returns companyId if company_hr, else null
  hasAccessToCompany: (companyId: string) => boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // frontend/src/lib/auth-context.tsx

const login = useCallback(async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const data = await res.json();

  // Store token + user
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  setToken(data.token);
  setUser(data.user);

  // 🆕 Dispatch a storage event to trigger AppContext refresh
  // (this also works across tabs!)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: TOKEN_KEY,
      newValue: data.token,
      storageArea: localStorage,
    })
  );
}, []);

  const logout = useCallback(() => {
  const oldToken = localStorage.getItem(TOKEN_KEY);

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setToken(null);
  setUser(null);

  // 🆕 Trigger refresh (candidates will be cleared)
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: TOKEN_KEY,
      oldValue: oldToken ?? undefined,
      newValue: null,
      storageArea: localStorage,
    })
  );
}, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        return;
      }
      const fresh = await res.json();
      setUser(fresh);
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {}
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refreshUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, refreshUser]);

  // Compute role flags
  const isSystemAdmin = user?.role === 'system_admin';
  const isHoldingHR = user?.role === 'holding_hr';
  const isCompanyHR = user?.role === 'company_hr';
  const isManagement = user?.role === 'management';

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,

    isSystemAdmin,
    isHoldingHR,
    isCompanyHR,
    isManagement,

    canManageAllCompanies: isSystemAdmin || isHoldingHR,
    canWrite: !isManagement,
    canManageUsers: isSystemAdmin,
    canApproveVacancies: isSystemAdmin || isHoldingHR,
    canCreateVacancy: isSystemAdmin || isHoldingHR || isCompanyHR,
    canViewDashboard: true,

    getCompanyFilter: () => (isCompanyHR && user?.companyId ? user.companyId : null),
    hasAccessToCompany: (companyId: string) => {
      if (isSystemAdmin || isHoldingHR || isManagement) return true;
      if (isCompanyHR) return user?.companyId === companyId;
      return false;
    },

    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}