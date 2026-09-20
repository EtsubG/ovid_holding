// backend/src/models/index.js
const sequelize = require('../config/database');
const Company = require('./Company');
const Vacancy = require('./Vacancy');
const Candidate = require('./Candidate');
const User = require('./User');
const Interview = require('./Interview');   // 🆕

// Company ↔ Vacancy
Company.hasMany(Vacancy, { foreignKey: 'companyId', as: 'vacancies' });
Vacancy.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Company ↔ Candidate
Company.hasMany(Candidate, { foreignKey: 'preferredCompany', as: 'candidates' });
Candidate.belongsTo(Company, { foreignKey: 'preferredCompany', as: 'company' });

// Vacancy ↔ Candidate
Vacancy.hasMany(Candidate, { foreignKey: 'vacancyId', as: 'candidates' });
Candidate.belongsTo(Vacancy, { foreignKey: 'vacancyId', as: 'vacancy' });

// User ↔ Company
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// 🆕 Candidate ↔ Interview
Candidate.hasMany(Interview, { foreignKey: 'candidateId', as: 'interviews' });
Interview.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = {
  sequelize,
  Company,
  Vacancy,
  Candidate,
  User,
  Interview,
};