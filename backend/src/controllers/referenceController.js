const { Company } = require('../models');

// These are static reference data that match the frontend
const departments = [
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
  'Administration'
];

const jobCategories = [
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
  'Management'
];

const locations = [
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'Riyadh, KSA',
  'Jeddah, KSA',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Cairo, Egypt',
  'Amman, Jordan',
  'Kuwait City, Kuwait',
  'Muscat, Oman'
];

const pipelineStages = [
  { key: 'Submitted', label: 'Submitted / Received', color: 'bg-slate-500' },
  { key: 'Under Review', label: 'Under Review', color: 'bg-blue-500' },
  { key: 'Shortlisted', label: 'Shortlisted', color: 'bg-cyan-500' },
  { key: 'Interview Scheduled', label: 'Interview Scheduled', color: 'bg-violet-500' },
  { key: 'Reference Check', label: 'Reference Check', color: 'bg-amber-500' },
  { key: 'Offer Issued', label: 'Offer Issued / Hired', color: 'bg-emerald-500' },
  { key: 'Talent Pool', label: 'Kept in Talent Pool', color: 'bg-teal-500' },
  { key: 'Rejected', label: 'Rejected / Withdrawn', color: 'bg-rose-500' }
];

exports.getDepartments = (req, res) => {
  res.json(departments);
};

exports.getJobCategories = (req, res) => {
  res.json(jobCategories);
};

exports.getLocations = (req, res) => {
  res.json(locations);
};

exports.getPipelineStages = (req, res) => {
  res.json(pipelineStages);
};