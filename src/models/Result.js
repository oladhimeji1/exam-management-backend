const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Result = sequelize.define('Result', {
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'results',
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
      fields: ['percentage'],
    },
    {
      fields: ['grade'],
    },
  ],
});

module.exports = Result;
