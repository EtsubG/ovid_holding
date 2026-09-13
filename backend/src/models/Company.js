// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortName: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  tagline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employees: {
    type: DataTypes.STRING,
    allowNull: false
  },
  founded: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  accent: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'companies',
  timestamps: true
});

// NO ASSOCIATIONS HERE - They're defined in index.js

module.exports = Company;