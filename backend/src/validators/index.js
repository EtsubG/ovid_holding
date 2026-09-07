const Joi = require('joi');

// Validation schemas
const applicationSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().allow(''),
  city: Joi.string().allow('').default('N/A'),
  nationality: Joi.string().allow('').default('N/A'),
  idType: Joi.string().allow(''),
  idNumber: Joi.string().allow(''),
  qualification: Joi.string().allow('').default('N/A'),
  fieldOfStudy: Joi.string().allow('').default('N/A'),
  institution: Joi.string().allow('').default('N/A'),
  graduationYear: Joi.string().allow('').default('N/A'),
  cgpa: Joi.string().allow(''),
  certificates: Joi.string().allow(''),
  currentStatus: Joi.string().allow(''),
  currentEmployer: Joi.string().allow(''),
  currentRole: Joi.string().allow(''),
  totalExperience: Joi.string().allow('').default('N/A'),
  relevantExperience: Joi.string().allow(''),
  availability: Joi.string().allow('').default('N/A'),
  expectedSalary: Joi.string().allow('').default('N/A'),
  preferredCompany: Joi.string().allow('').default(''),
  preferredDepartment: Joi.string().allow('').default(''),
  vacancyId: Joi.string().allow(null, '')
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