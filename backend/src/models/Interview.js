// backend/src/models/Interview.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Phone', 'Video', 'In-Person', 'Technical', 'Behavioral', 'Final'),
    allowNull: false,
    defaultValue: 'Video',
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // minutes
    defaultValue: 60,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interviewerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interviewerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-Show'),
    defaultValue: 'Scheduled',
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER, // 1-5
    allowNull: true,
    validate: { min: 1, max: 5 },
  },
}, {
  tableName: 'interviews',
  timestamps: true,
});

module.exports = Interview;