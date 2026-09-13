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
    'Shortlisted',
    'Interview Scheduled',
    'Reference Check',
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

module.exports = {
  applicationSchema,
  statusUpdateSchema,
  noteSchema,
  talentPoolSchema,
};