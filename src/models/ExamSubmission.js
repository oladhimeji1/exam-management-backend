const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamSubmission = sequelize.define('ExamSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id',
    },
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gradedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded'),
    allowNull: false,
    defaultValue: 'submitted',
  },
  violations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'exam_submissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examId', 'studentId'],
    },
    {
      fields: ['examId'],
    },
    {
      fields: ['studentId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['submittedAt'],
    },
  ],
});

module.exports = ExamSubmission;
