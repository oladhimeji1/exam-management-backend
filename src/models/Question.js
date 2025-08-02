//  import { DataTypes } from 'sequelize';
// import { sequelize } from '../config/database.js';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('multiple_choice', 'theory'),
    allowNull: false,
  },
  option_a: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  option_b: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  option_c: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  option_d: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  correct_answer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'questions',
});
  
module.exports = Question;
