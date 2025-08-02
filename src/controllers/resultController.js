import Result from '../models/Result.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getResults = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { examId, studentId, classId } = req.query;

    let whereClause = {};

    if (examId) whereClause.examId = examId;
    if (studentId) whereClause.studentId = studentId;

    // Role-based filtering
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (student) {
        whereClause.studentId = student.id;
      }
    }

    const { count, rows } = await Result.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Exam, 
          as: 'exam',
          include: [{ model: Subject, as: 'subject' }]
        },
        { 
          model: Student, 
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
      ],
      limit,
      offset,
      order: [['gradedAt', 'DESC']],
    });

    const response = createPaginationResponse(rows, count, page, limit);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await Result.findByPk(id, {
      include: [
        { 
          model: Exam, 
          as: 'exam',
          include: [{ model: Subject, as: 'subject' }]
        },
        { 
          model: Student, 
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
      ],
    });

    if (!result) {
      throw new AppError('Result not found', 404);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Students can only access their own results
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
        });
      }
    }

    const results = await Result.findAll({
      where: { studentId },
      include: [
        { 
          model: Exam, 
          as: 'exam',
          include: [{ model: Subject, as: 'subject' }]
        },
      ],
      order: [['gradedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const results = await Result.findAll({
      where: { examId },
      include: [
        { 
          model: Student, 
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
      ],
      order: [['percentage', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const results = await Result.findAll({
      include: [
        { 
          model: Exam, 
          as: 'exam',
          include: [{ model: Subject, as: 'subject' }]
        },
        { 
          model: Student, 
          as: 'student',
          where: { classId },
          include: [{ model: User, as: 'user' }]
        },
      ],
      order: [['gradedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const results = await Result.findAll({
      include: [
        { 
          model: Exam, 
          as: 'exam',
          where: { subjectId },
          include: [{ model: Subject, as: 'subject' }]
        },
        { 
          model: Student, 
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
      ],
      order: [['gradedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const filters = req.body;
    
    // Implementation for custom report generation would go here
    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const exportToPDF = async (req, res, next) => {
  try {
    // Implementation for PDF export would go here
    res.status(200).json({
      success: true,
      message: 'PDF export completed',
    });
  } catch (error) {
    next(error);
  }
};

export const exportToCSV = async (req, res, next) => {
  try {
    // Implementation for CSV export would go here
    res.status(200).json({
      success: true,
      message: 'CSV export completed',
    });
  } catch (error) {
    next(error);
  }
};