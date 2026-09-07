// src/lib/api.ts
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

// Companies
export async function getCompanies() {
  return fetchAPI('/companies');
}

export async function getCompany(id: string) {
  return fetchAPI(`/companies/${id}`);
}

// Vacancies
export async function getVacancies(filters?: {
  company?: string;
  location?: string;
  department?: string;
  type?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.company && filters.company !== 'all') params.append('company', filters.company);
  if (filters?.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
  if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters?.search) params.append('search', filters.search);
  
  const query = params.toString();
  return fetchAPI(`/vacancies${query ? `?${query}` : ''}`);
}

export async function getVacancy(id: string) {
  return fetchAPI(`/vacancies/${id}`);
}

// Candidates/Applications
export async function submitApplication(data: any) {
  return fetchAPI('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCandidates(filters?: any) {
  const params = new URLSearchParams();
  if (filters?.company && filters.company !== 'all') params.append('company', filters.company);
  if (filters?.department && filters.department !== 'all') params.append('department', filters.department);
  if (filters?.location && filters.location !== 'all') params.append('location', filters.location);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  
  const query = params.toString();
  return fetchAPI(`/applications${query ? `?${query}` : ''}`);
}

export async function getCandidate(id: string) {
  return fetchAPI(`/applications/${id}`);
}

export async function updateCandidateStatus(id: string, status: string) {
  return fetchAPI(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function addCandidateNote(id: string, text: string) {
  return fetchAPI(`/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function getDashboardStats() {
  return fetchAPI('/applications/stats');
}

// Reference data
export async function getDepartments() {
  return fetchAPI('/references/departments');
}

export async function getLocations() {
  return fetchAPI('/references/locations');
}

export async function getJobCategories() {
  return fetchAPI('/references/job-categories');
}

export async function getPipelineStages() {
  return fetchAPI('/references/pipeline-stages');
}