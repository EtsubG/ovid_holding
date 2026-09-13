// models/Candidate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  altPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  highestQualification: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  fieldOfStudy: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  graduationYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  cgpa: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  currentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  currentEmployer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalExperience: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relevantExperience: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  expectedSalary: {
    type: DataTypes.STRING,
    allowNull: false
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preferredCompany: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  preferredDepartment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vacancyId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Submitted',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Reference Check',
      'Offer Issued',
      'Hired',
      'Talent Pool',
      'Rejected'
    ),
    allowNull: false,
    defaultValue: 'Submitted'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  notes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'candidates',
  timestamps: true
});

// NO ASSOCIATIONS HERE - They're defined in index.js

module.exports = Candidate;