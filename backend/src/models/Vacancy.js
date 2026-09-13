// models/Vacancy.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vacancy = sequelize.define('Vacancy', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship'),
    allowNull: false
  },
  experienceLevel: {
    type: DataTypes.ENUM('Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead', 'Executive'),
    allowNull: false
  },
  experienceYears: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salaryRange: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  closingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  responsibilities: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  preferred: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'vacancies',
  timestamps: true
});

// NO ASSOCIATIONS HERE - They're defined in index.js

module.exports = Vacancy;