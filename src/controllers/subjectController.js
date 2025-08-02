import { body } from 'express-validator';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const createSubjectValidation = [
  body('name').isLength({ min: 2 }).withMessage('Subject name must be at least 2 characters'),
  body('code').isLength({ min: 2 }).withMessage('Subject code must be at least 2 characters'),
  body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
];

export const createSubject = async (req, res, next) => {
  try {
    const subjectData = req.body;
    const subject = await Subject.create(subjectData);

    const createdSubject = await Subject.findByPk(subject.id, {
      include: [
        { 
          model: Teacher, 
          as: 'teacher', 
          include: [{ model: User, as: 'user' }] 
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: createdSubject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, teacherId, classId } = req.query;

    let whereClause = {};

    if (teacherId) whereClause.teacherId = teacherId;
    if (classId) whereClause.classIds = { [Op.contains]: [classId] };
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Subject.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Teacher, 
          as: 'teacher', 
          include: [{ model: User, as: 'user' }] 
        },
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

export const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id, {
      include: [
        { 
          model: Teacher, 
          as: 'teacher', 
          include: [{ model: User, as: 'user' }] 
        },
      ],
    });

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subject = await Subject.findByPk(id);

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    await subject.update(updateData);

    const updatedSubject = await Subject.findByPk(id, {
      include: [
        { 
          model: Teacher, 
          as: 'teacher', 
          include: [{ model: User, as: 'user' }] 
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    await subject.destroy();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const subjects = await Subject.findAll({
      where: {
        classIds: { [Op.contains]: [classId] },
      },
      include: [
        { 
          model: Teacher, 
          as: 'teacher', 
          include: [{ model: User, as: 'user' }] 
        },
      ],
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};
