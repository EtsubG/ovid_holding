const Joi = require('joi');

// Validation schemas
const applicationSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().allow(''),
  city: Joi.string().required(),
  nationality: Joi.string().required(),
  idType: Joi.string(),
  idNumber: Joi.string(),
  qualification: Joi.string().required(),
  fieldOfStudy: Joi.string().required(),
  institution: Joi.string().required(),
  graduationYear: Joi.string().required(),
  cgpa: Joi.string(),
  certificates: Joi.string().allow(''),
  currentStatus: Joi.string(),
  currentEmployer: Joi.string().allow(''),
  currentRole: Joi.string().allow(''),
  totalExperience: Joi.string().required(),
  relevantExperience: Joi.string().allow(''),
  availability: Joi.string().required(),
  expectedSalary: Joi.string().required(),
  preferredCompany: Joi.string().required(),
  preferredDepartment: Joi.string().required(),
  vacancyId: Joi.string().allow(null)
});

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
  ).required()
});

const noteSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required()
});

const talentPoolSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  city: Joi.string().allow(''),
  preferredCompany: Joi.string().allow(''),
  department: Joi.string().allow(''),
  jobCategory: Joi.string().allow(''),
  location: Joi.string().allow(''),
  employmentType: Joi.string().allow(''),
  experienceLevel: Joi.string().allow(''),
  availability: Joi.string().allow(''),
  expectedSalary: Joi.string().allow(''),
  yearsExperience: Joi.string().allow(''),
  coverNote: Joi.string().allow('')
});

module.exports = {
  applicationSchema,
  statusUpdateSchema,
  noteSchema,
  talentPoolSchema
};