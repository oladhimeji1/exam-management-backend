const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id',
    },
  },
  class: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'subjects',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code'],
    },
    {
      fields: ['teacherId'],
    },
    {
      fields: ['name'],
    },
  ],
});

module.exports = Subject;
