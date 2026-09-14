// backend/src/validators/index.js
const Joi = require('joi');

const applicationSchema = Joi.object({
  // Personal
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().allow('', null),
  city: Joi.string().allow('', null),         // ← Make optional
  nationality: Joi.string().allow('', null),  // ← Make optional

  // Identity
  idType: Joi.string().allow('', null),
  idNumber: Joi.string().allow('', null),

  // Academic
  qualification: Joi.string().allow('', null),      // ← Make optional
  fieldOfStudy: Joi.string().allow('', null),       // ← Make optional
  institution: Joi.string().allow('', null),        // ← Make optional
  graduationYear: Joi.string().allow('', null),     // ← Make optional
  cgpa: Joi.string().allow('', null),
  certificates: Joi.string().allow('', null),

  // Employment
  currentStatus: Joi.string().allow('', null),
  currentEmployer: Joi.string().allow('', null),
  currentRole: Joi.string().allow('', null),
  totalExperience: Joi.string().allow('', null),    // ← Make optional
  relevantExperience: Joi.string().allow('', null),
  availability: Joi.string().allow('', null),       // ← Make optional
  expectedSalary: Joi.string().allow('', null),     // ← Make optional

  // Preferences
  preferredCompany: Joi.string().allow('', null),   // ← Make optional
  preferredDepartment: Joi.string().allow('', null),// ← Make optional
  vacancyId: Joi.string().allow(null, ''),

  // Meta
  reference: Joi.string().allow('', null),
  status: Joi.string().allow('', null),
}).unknown(true);


const statusUpdateSchema = Joi.object({
  status: Joi.string().valid(
    'Submitted',
    'Under Review',
    'Longlisted',           // 🆕
    'Shortlisted',
    'Interview Scheduled',
    'Reference Check',
    'Selected',             // 🆕
    'Offer Issued',
    'Hired',
    'Talent Pool',
    'Rejected'
  ).required(),
});

const noteSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
});

const talentPoolSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  city: Joi.string().allow('', null),
  preferredCompany: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  jobCategory: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  employmentType: Joi.string().allow('', null),
  experienceLevel: Joi.string().allow('', null),
  availability: Joi.string().allow('', null),
  expectedSalary: Joi.string().allow('', null),
  yearsExperience: Joi.string().allow('', null),
  coverNote: Joi.string().allow('', null),
}).unknown(true);

// Add to backend/src/validators/index.js

const vacancySchema = Joi.object({
  id: Joi.string().max(50).optional(),   // Optional — auto-generated if not provided
  title: Joi.string().min(3).max(200).required(),
  companyId: Joi.string().required(),
  department: Joi.string().required(),
  location: Joi.string().required(),
  type: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Internship').required(),
  experienceLevel: Joi.string()
    .valid('Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead', 'Executive')
    .required(),
  experienceYears: Joi.string().required(),
  salaryRange: Joi.string().required(),
  postedDate: Joi.date().optional(),
  closingDate: Joi.date().required(),
  summary: Joi.string().min(20).max(500).required(),
  description: Joi.string().min(20).required(),
  responsibilities: Joi.array().items(Joi.string()).default([]),
  requirements: Joi.array().items(Joi.string()).default([]),
  preferred: Joi.array().items(Joi.string()).default([]),
  documents: Joi.array().items(Joi.string()).default([]),
  featured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
}).unknown(true);

// Add to backend/src/validators/index.js

const companySchema = Joi.object({
  id: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base':
        'ID must only contain lowercase letters, numbers, and hyphens (e.g. "ovid-aerospace")',
    }),
  name: Joi.string().min(3).max(100).required(),
  shortName: Joi.string().min(2).max(10).required(),
  tagline: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).required(),
  industry: Joi.string().min(3).max(100).required(),
  location: Joi.string().min(3).max(100).required(),
  employees: Joi.string().min(1).max(50).required(),
  founded: Joi.string().max(10).required(),
  accent: Joi.string().max(100).required(),
  icon: Joi.string().max(50).required(),
}).unknown(true);

// Update the exports:
module.exports = {
  applicationSchema,
  statusUpdateSchema,
  noteSchema,
  talentPoolSchema,
  vacancySchema,
  companySchema,   // 🆕
};

