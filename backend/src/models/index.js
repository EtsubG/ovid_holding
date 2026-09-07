// models/index.js
const sequelize = require('../config/database');
const Company = require('./Company');
const Vacancy = require('./Vacancy');
const Candidate = require('./Candidate');

// Associations - Defined ONLY ONCE
Company.hasMany(Vacancy, { foreignKey: 'companyId', as: 'vacancies' });
Vacancy.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Candidate, { foreignKey: 'preferredCompany', as: 'candidates' });
Candidate.belongsTo(Company, { foreignKey: 'preferredCompany', as: 'company' });

Vacancy.hasMany(Candidate, { foreignKey: 'vacancyId', as: 'candidates' });
Candidate.belongsTo(Vacancy, { foreignKey: 'vacancyId', as: 'vacancy' });

module.exports = {
  sequelize,
  Company,
  Vacancy,
  Candidate
};