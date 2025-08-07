import { body } from 'express-validator';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const createClassValidation = [
  body('name').isLength({ min: 2 }).withMessage('Class name must be at least 2 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
];

export const createClass = async (req, res, next) => {
  try {
    const classData = req.body;
    const newClass = await Class.create(classData);

    const createdClass = await Class.findByPk(newClass.id);
    // , {
    //   include: [
    //     { 
    //       model: Teacher, 
    //       as: 'teacher', 
    //       include: [{ model: User, as: 'user' }] 
    //     },
    //   ],
    // }

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: createdClass,
    });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, teacherId } = req.query;

    let whereClause = {};

    if (teacherId) whereClause.teacherId = teacherId;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Class.findAndCountAll({
      where: whereClause,
      // include: [
      //   { 
      //     model: Teacher, 
      //     as: 'teacher', 
      //     include: [{ model: User, as: 'user' }] 
      //   },
      // ],
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

export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findByPk(id);

    // , {
    //   include: [
    //     { 
    //       model: Teacher, 
    //       as: 'teacher', 
    //       include: [{ model: User, as: 'user' }] 
    //     },
    //   ],
    // }

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const classData = await Class.findByPk(id);

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    await classData.update(updateData);

    const updatedClass = await Class.findByPk(id);

    // , {
    //   include: [
    //     { 
    //       model: Teacher, 
    //       as: 'teacher', 
    //       include: [{ model: User, as: 'user' }] 
    //     },
    //   ],
    // }

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    // Check if class has students
    if (classData.studentsCount > 0) {
      throw new AppError('Cannot delete class with enrolled students', 400);
    }

    await classData.destroy();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};