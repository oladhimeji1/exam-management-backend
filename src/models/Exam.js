const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  examType: {
    type: DataTypes.ENUM('entrance', 'regular'),
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'id',
    },
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'id',
    },
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'teachers' || 'users',
      key: 'id',
    },
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'completed'),
    allowNull: false,
    defaultValue: 'draft',
  },
}, {
  tableName: 'exams',
  timestamps: true,
  indexes: [
    {
      fields: ['authorId'],
    },
    {
      fields: ['subjectId'],
    },
    {
      fields: ['classId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['examType'],
    },
    {
      fields: ['startDate', 'endDate'],
    },
  ],
});

module.exports = Exam;
