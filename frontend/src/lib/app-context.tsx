import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { candidates as initialCandidates, type Candidate, type ApplicationStatus } from '@/lib/data';

interface AppContextValue {
  page: string;
  params: Record<string, string>;
  navigate: (page: string, params?: Record<string, string>) => void;
  hrMode: boolean;
  setHrMode: (v: boolean) => void;
  candidates: Candidate[];
  updateCandidateStatus: (id: string, status: ApplicationStatus) => void;
  addCandidateNote: (id: string, text: string) => void;
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
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const navigate = useCallback((newPage: string, newParams: Record<string, string> = {}) => {
    setPage(newPage);
    setParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateCandidateStatus = useCallback((id: string, status: ApplicationStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }, []);

  const addCandidateNote = useCallback((id: string, text: string) => {
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
