// src/lib/data.ts
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type ExperienceLevel = 'Entry Level' | 'Junior' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive';

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Reference Check'
  | 'Offer Issued'
  | 'Hired'
  | 'Talent Pool'
  | 'Rejected';

export interface Company {
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

export interface Vacancy {
  id: string;
  title: string;
  companyId: string;
  department: string;
  location: string;
  type: EmploymentType;
  experienceLevel: ExperienceLevel;
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
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  city: string;
  nationality: string;
  highestQualification: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  cgpa: string;
  currentStatus: string;
  currentEmployer?: string;
  currentRole?: string;
  totalExperience: string;
  relevantExperience: string;
  expectedSalary: string;
  availability: string;
  preferredCompany: string;
  preferredDepartment: string;
  vacancyId?: string;
  status: ApplicationStatus;
  submittedAt: string;
  documents: { name: string; type: string; size: string }[];
  notes: { author: string; date: string; text: string }[];
  reference: string;
  // Nested objects returned by the API via JOIN
  company?: { id: string; name: string; shortName: string };
  vacancy?: { id: string; title: string; department: string };
}

// Static reference data (these could also come from API, but kept as fallback)
export const departments = [
  'Finance & Accounting',
  'Sales & Marketing',
  'Engineering',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Legal & Compliance',
  'Customer Experience',
  'Project Management',
  'Design & Architecture',
  'Procurement',
  'Administration',
];

export const jobCategories = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Technology',
  'Hospitality',
  'Construction',
  'Design',
  'Administration',
  'Customer Service',
  'Management',
];

export const locations = [
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, KSA',
  'Jeddah, KSA',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Cairo, Egypt',
  'Amman, Jordan',
  'Kuwait City, Kuwait',
  'Muscat, Oman',
];

export const pipelineStages: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'Submitted', label: 'Submitted / Received', color: 'bg-slate-500' },
  { key: 'Under Review', label: 'Under Review', color: 'bg-blue-500' },
  { key: 'Shortlisted', label: 'Shortlisted', color: 'bg-cyan-500' },
  { key: 'Interview Scheduled', label: 'Interview Scheduled', color: 'bg-violet-500' },
  { key: 'Reference Check', label: 'Reference Check', color: 'bg-amber-500' },
  { key: 'Offer Issued', label: 'Offer Issued / Hired', color: 'bg-emerald-500' },
  { key: 'Talent Pool', label: 'Kept in Talent Pool', color: 'bg-teal-500' },
  { key: 'Rejected', label: 'Rejected / Withdrawn', color: 'bg-rose-500' },
];

export function generateReference(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `OVID-${year}-${num}`;
}

export function getCompany(id: string): Company | undefined {
  // This is now a fallback - should use API
  return undefined;
}

export function getVacancy(id: string): Vacancy | undefined {
  // This is now a fallback - should use API
  return undefined;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}