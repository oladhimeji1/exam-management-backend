import { body } from 'express-validator';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const createTeacherValidation = [
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('teacherId').isLength({ min: 3 }).withMessage('Teacher ID must be at least 3 characters'),
  body('department').isLength({ min: 2 }).withMessage('Department must be at least 2 characters'),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('classes').isArray().withMessage('Classes must be an array'),
];

export const createTeacher = async (req, res, next) => {
  try {
    const teacherData = req.body;
    const teacher = await Teacher.create(teacherData);

    const createdTeacher = await Teacher.findByPk(teacher.id, {
      include: [{ model: User, as: 'user' }],
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: createdTeacher,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, department, subjectId } = req.query;

    let whereClause = {};

    if (department) whereClause.department = department;
    if (subjectId) whereClause.subjects = { [Op.contains]: [subjectId] };
    if (search) {
      whereClause[Op.or] = [
        { teacherId: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Teacher.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'user' }],
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

export const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    await teacher.update(updateData);

    const updatedTeacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    await teacher.destroy();

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTeachersBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const teachers = await Teacher.findAll({
      where: {
        subjects: { [Op.contains]: [subjectId] },
      },
      include: [{ model: User, as: 'user' }],
      order: [['user', 'firstName', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};