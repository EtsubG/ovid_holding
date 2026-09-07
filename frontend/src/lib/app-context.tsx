import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type Candidate, type ApplicationStatus, pipelineStages } from '@/lib/data';
import * as api from './api';

interface AppContextValue {
  page: string;
  params: Record<string, string>;
  navigate: (page: string, params?: Record<string, string>) => void;
  hrMode: boolean;
  setHrMode: (v: boolean) => void;
  candidates: Candidate[];
  loading: boolean;
  updateCandidateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  addCandidateNote: (id: string, text: string) => Promise<void>;
  addCandidate: (c: Candidate) => void;
  refreshCandidates: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const navigate = useCallback((newPage: string, newParams: Record<string, string> = {}) => {
    setPage(newPage);
    setParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateCandidateStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    try {
      await api.updateCandidateStatus(id, status);
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }, []);

  const addCandidateNote = useCallback(async (id: string, text: string) => {
    try {
      await api.addCandidateNote(id, text);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                notes: [
                  ...c.notes,
                  { author: 'You', date: new Date().toISOString().split('T')[0], text },
                ],
              }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  }, []);

  const addCandidate = useCallback((c: Candidate) => {
    setCandidates((prev) => [c, ...prev]);
  }, []);

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
        updateCandidateStatus,
        addCandidateNote,
        addCandidate,
        refreshCandidates: fetchCandidates,
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