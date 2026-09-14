// src/lib/api.ts
import type { Company, Vacancy, Candidate } from '@/lib/data';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ── Token helpers ──────────────────────────────
const TOKEN_KEY = 'ovid_auth_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Core helper ──────────────────────────────
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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

// frontend/src/lib/api.ts

// ─────────────────────────────────────────────
// Export helpers
// ─────────────────────────────────────────────
async function downloadFile(endpoint: string, filename: string) {
  const token = localStorage.getItem('ovid_auth_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Download failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportCandidatesExcel(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  const query = params.toString();
  const filename = `candidates-${new Date().toISOString().split('T')[0]}.xlsx`;
  await downloadFile(`/exports/candidates/excel${query ? `?${query}` : ''}`, filename);
}

export async function exportCandidatesPDF(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  const query = params.toString();
  const filename = `candidates-${new Date().toISOString().split('T')[0]}.pdf`;
  await downloadFile(`/exports/candidates/pdf${query ? `?${query}` : ''}`, filename);
}

// ── Companies ────────────────────────────────
export async function getCompanies(): Promise<Company[]> {
  return fetchAPI<Company[]>('/companies');
}

export async function getCompany(id: string): Promise<Company> {
  return fetchAPI<Company>(`/companies/${id}`);
}

// ── Vacancies ────────────────────────────────
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

// ── Applications / Candidates ────────────────
export interface SubmitApplicationResult {
  id: string;
  reference: string;
  message: string;
}

export async function submitApplication(
  data: Record<string, unknown>
): Promise<SubmitApplicationResult> {
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

export async function updateCandidateStatus(
  id: string,
  status: string
): Promise<StatusUpdateResult> {
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

// ── Reference data ───────────────────────────
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


// frontend/src/lib/api.ts

// ─────────────────────────────────────────────
// Interviews
// ─────────────────────────────────────────────
export interface Interview {
  id: string;
  candidateId: string;
  title: string;
  type: 'Phone' | 'Video' | 'In-Person' | 'Technical' | 'Behavioral' | 'Final';
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'No-Show';
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    fullName: string;
    email: string;
    vacancy?: { id: string; title: string };
    company?: { id: string; name: string };
  };
}

export interface CreateInterviewInput {
  candidateId: string;
  title: string;
  type: string;
  scheduledDate: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  notes?: string;
}

export async function getInterviews(filters?: Record<string, string>): Promise<Interview[]> {
  const params = new URLSearchParams(filters || {});
  const query = params.toString();
  return fetchAPI<Interview[]>(`/interviews${query ? `?${query}` : ''}`);
}

export async function getUpcomingInterviews(): Promise<Interview[]> {
  return fetchAPI<Interview[]>('/interviews?upcoming=true');
}

export async function getInterviewStats() {
  return fetchAPI('/interviews/stats');
}

export async function getCandidateInterviews(candidateId: string): Promise<Interview[]> {
  return fetchAPI<Interview[]>(`/interviews/candidate/${candidateId}`);
}

export async function createInterview(data: CreateInterviewInput): Promise<Interview> {
  return fetchAPI<Interview>('/interviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInterview(
  id: string,
  data: Partial<CreateInterviewInput> & {
    status?: string;
    feedback?: string;
    rating?: number;
    decision?: 'pass' | 'fail' | 'maybe';
  }
): Promise<Interview> {
  return fetchAPI<Interview>(`/interviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInterview(id: string) {
  return fetchAPI(`/interviews/${id}`, { method: 'DELETE' });
}

// ── Auth API ──────────────────────────────
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'holding_hr' | 'company_hr' | 'management';
    companyId: string | null;
    company?: { id: string; name: string } | null;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function getMe() {
  return fetchAPI('/auth/me');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return fetchAPI('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Admin user management
export async function getAllUsers() {
  return fetchAPI('/auth/users');
}

export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  companyId?: string | null;
}) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: string,
  data: { fullName?: string; role?: string; companyId?: string | null; isActive?: boolean }
) {
  return fetchAPI(`/auth/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return fetchAPI(`/auth/users/${id}`, { method: 'DELETE' });
}

export async function resetUserPassword(id: string, newPassword: string) {
  return fetchAPI(`/auth/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}

// ── File uploads / documents ─────────────────
export async function uploadDocuments(
  candidateId: string,
  cvFile: File,
  documents: File[] = []
): Promise<{ message: string; documents: unknown[] }> {
  const formData = new FormData();

  if (cvFile) {
    formData.append('cv', cvFile);
  }

  documents.forEach((doc) => {
    formData.append('documents', doc);
  });

  const res = await fetch(`${API_BASE}/applications/${candidateId}/upload`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }, // Added auth headers
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to upload files');
  }

  return res.json();
}

export function getDocumentUrl(candidateId: string, filename: string): string {
  return `${API_BASE}/applications/${candidateId}/documents/${filename}`;
}

export function getDownloadUrl(candidateId: string, filename: string): string {
  return `${API_BASE}/applications/${candidateId}/documents/${filename}/download`;
}

// Add to frontend/src/lib/api.ts

export interface CreateVacancyInput {
  id?: string;
  title: string;
  companyId: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  experienceYears: string;
  salaryRange: string;
  postedDate?: string;
  closingDate: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  documents: string[];
  featured?: boolean;
  isActive?: boolean;
}

export async function createVacancy(data: CreateVacancyInput) {
  return fetchAPI('/vacancies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVacancy(id: string, data: Partial<CreateVacancyInput>) {
  return fetchAPI(`/vacancies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVacancy(id: string) {
  return fetchAPI(`/vacancies/${id}`, { method: 'DELETE' });
}

export async function toggleVacancyActive(id: string) {
  return fetchAPI(`/vacancies/${id}/toggle-active`, { method: 'PATCH' });
}

export async function toggleVacancyFeatured(id: string) {
  return fetchAPI(`/vacancies/${id}/toggle-featured`, { method: 'PATCH' });
}

// Also get ALL vacancies (including drafts) for HR
export async function getAllVacanciesAdmin() {
  return fetchAPI('/vacancies?includeInactive=true');
}

// ── Grouped API object (for components using `api.getX()`) ─
export const api = {
  getCompanies,
  getCompany,
  getVacancies,
  getVacancy,
  submitApplication,
  getCandidates,
  getCandidate,
  updateCandidateStatus,
  addCandidateNote,
  getStats: getDashboardStats,
  getDepartments,
  getLocations,
  getJobCategories,
  getPipelineStages,
  uploadDocuments,
  getDocumentUrl,
  getDownloadUrl,
  // Auth
  login,
  getMe,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  // Vacancy CRUD (HR)
  createVacancy,
  updateVacancy,
  deleteVacancy,
  toggleVacancyActive,
  toggleVacancyFeatured,
  getAllVacanciesAdmin,
  //
  exportCandidatesExcel,
  exportCandidatesPDF,
  // Interviews
  getInterviews,
  getUpcomingInterviews,
  getInterviewStats,
  getCandidateInterviews,
  createInterview,
  updateInterview,
  deleteInterview,


};