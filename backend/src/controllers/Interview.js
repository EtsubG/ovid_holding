const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Phone', 'Video', 'In-Person', 'Technical', 'Behavioral', 'Final'),
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // Minutes
    defaultValue: 60
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interviewerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interviewerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-Show'),
    defaultValue: 'Scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'interviews',
  timestamps: true
});

Interview.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });
Candidate.hasMany(Interview, { foreignKey: 'candidateId', as: 'interviews' });

module.exports = Interview;