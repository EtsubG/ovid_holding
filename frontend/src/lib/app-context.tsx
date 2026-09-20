// frontend/src/lib/app-context.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { Candidate, ApplicationStatus } from './data';

interface AppContextValue {
  page: string;
  params: Record<string, string>;
  navigate: (page: string, params?: Record<string, string>) => void;
  hrMode: boolean;
  setHrMode: (v: boolean) => void;
  candidates: Candidate[];
  loading: boolean;
  refreshCandidates: () => Promise<void>;
  updateCandidateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  addCandidateNote: (id: string, text: string) => Promise<void>;
  addCandidate: (c: Candidate) => void;
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState<Record<string, string>>({});
  const [hrMode, setHrMode] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCandidates = useCallback(async () => {
    // 🆕 Only fetch if there's a token (HR is logged in)
    const token = localStorage.getItem('ovid_auth_token');
    if (!token) {
      setCandidates([]);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      // If 401, clear candidates
      if (error instanceof Error && error.message.includes('401')) {
        setCandidates([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 🆕 Listen for token changes (login/logout)
  useEffect(() => {
    // Initial load
    refreshCandidates();

    // Listen for storage events (cross-tab) — auto-refresh on login/logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ovid_auth_token') {
        refreshCandidates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCandidates]);

  const navigate = useCallback(
    (newPage: string, newParams: Record<string, string> = {}) => {
      setPage(newPage);
      setParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const updateCandidateStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      try {
        await api.updateCandidateStatus(id, status);
        await refreshCandidates();
      } catch (error) {
        console.error('Failed to update status:', error);
        throw error;
      }
    },
    [refreshCandidates]
  );

  const addCandidateNote = useCallback(
    async (id: string, text: string) => {
      try {
        await api.addCandidateNote(id, text);
        await refreshCandidates();
      } catch (error) {
        console.error('Failed to add note:', error);
        throw error;
      }
    },
    [refreshCandidates]
  );

  const addCandidate = useCallback(
    (c: Candidate) => {
      refreshCandidates();
    },
    [refreshCandidates]
  );

  return (
    <AppContext.Provider
      value={{
        page,
        params,
        navigate,
        hrMode,
        setHrMode,
        candidates,
        loading,
        refreshCandidates,
        updateCandidateStatus,
        addCandidateNote,
        addCandidate,
        selectedCandidateId,
        setSelectedCandidateId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}