// src/lib/api.ts
import type { Company, Vacancy, Candidate } from '@/lib/data';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ── Companies ───────────────────────────────────────────────────────────────

export async function getCompanies(): Promise<Company[]> {
  return fetchAPI<Company[]>('/companies');
}

export async function getCompany(id: string): Promise<Company> {
  return fetchAPI<Company>(`/companies/${id}`);
}

// ── Vacancies ────────────────────────────────────────────────────────────────

export interface VacancyFilters {
  company?: string;
  location?: string;
  department?: string;
  type?: string;
  search?: string;
  featured?: boolean;
}

export async function getVacancies(filters?: VacancyFilters): Promise<Vacancy[]> {
  const params = new URLSearchParams();
  if (filters?.company && filters.company !== 'all') params.append('company', filters.company);
  if (filters?.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
  if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.featured) params.append('featured', 'true');

  const query = params.toString();
  return fetchAPI<Vacancy[]>(`/vacancies${query ? `?${query}` : ''}`);
}

export async function getVacancy(id: string): Promise<Vacancy & { company?: Company }> {
  return fetchAPI<Vacancy & { company?: Company }>(`/vacancies/${id}`);
}

// ── Candidates / Applications ─────────────────────────────────────────────

export interface SubmitApplicationResult {
  id: string;
  reference: string;
  message: string;
}

export async function submitApplication(data: Record<string, unknown>): Promise<SubmitApplicationResult> {
  return fetchAPI<SubmitApplicationResult>('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface CandidateFilters {
  company?: string;
  department?: string;
  location?: string;
  status?: string;
  search?: string;
}

export async function getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
  const params = new URLSearchParams();
  if (filters?.company && filters.company !== 'all') params.append('company', filters.company);
  if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
  if (filters?.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString();
  return fetchAPI<Candidate[]>(`/applications${query ? `?${query}` : ''}`);
}

export async function getCandidate(id: string): Promise<Candidate> {
  return fetchAPI<Candidate>(`/applications/${id}`);
}

export interface StatusUpdateResult {
  id: string;
  status: string;
  message: string;
}

export async function updateCandidateStatus(id: string, status: string): Promise<StatusUpdateResult> {
  return fetchAPI<StatusUpdateResult>(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export interface NoteResult {
  id: string;
  notes: Candidate['notes'];
  message: string;
}

export async function addCandidateNote(id: string, text: string): Promise<NoteResult> {
  return fetchAPI<NoteResult>(`/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export interface DashboardStats {
  total: number;
  submitted: number;
  underReview: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  hired: number;
  rejected: number;
  pool: number;
  conversionRate: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/applications/stats');
}

// ── Reference data ────────────────────────────────────────────────────────

export async function getDepartments(): Promise<string[]> {
  return fetchAPI<string[]>('/references/departments');
}

export async function getLocations(): Promise<string[]> {
  return fetchAPI<string[]>('/references/locations');
}

export async function getJobCategories(): Promise<string[]> {
  return fetchAPI<string[]>('/references/job-categories');
}

export interface PipelineStage {
  key: string;
  label: string;
  color: string;
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  return fetchAPI<PipelineStage[]>('/references/pipeline-stages');
}
