import { body } from 'express-validator';
import Student from '../models/Student.js';
import User from '../models/User.js';
import  Class from '../models/Class.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { StudentService } from '../services/studentService.js';

export const createStudentValidation = [
  body('userId').isUUID().withMessage('Invalid user ID'),
  // body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
  // body('parentContact').isMobilePhone().withMessage('Invalid parent contact number'),
  body('parentEmail').isEmail().withMessage('Invalid email'),
];

export const createStudent = async (req, res, next) => {
  try {

    const studentData = req.body;
    const createdStudent = await StudentService.createStudentRecord(studentData);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: createdStudent,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, classId } = req.query;

    let whereClause = {};

    if (classId) whereClause.classId = classId;
    if (search) {
      whereClause[Op.or] = [
        { studentId: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        { model: Class, as: 'class' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Class, as: 'class' },
      ],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Handle class change
    const oldClassId = student.classId;
    const newClassId = updateData.classId;

    await student.update(updateData);

    // Update class student counts
    if (oldClassId !== newClassId) {
      if (oldClassId) {
        await Class.decrement('studentsCount', { where: { id: oldClassId } });
      }
      if (newClassId) {
        await Class.increment('studentsCount', { where: { id: newClassId } });
      }
    }

    const updatedStudent = await Student.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: Class, as: 'class' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Update class student count
    if (student.classId) {
      await Class.decrement('studentsCount', { where: { id: student.classId } });
    }

    await student.destroy();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { page, limit, offset } = getPaginationOptions(req);

    const { count, rows } = await Student.findAndCountAll({
      where: { classId },
      include: [
        { model: User, as: 'user' },
      ],
      limit,
      offset,
      order: [['user', 'firstName', 'ASC']],
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