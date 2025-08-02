import { body, param } from 'express-validator';
import multer from 'multer';
import { ExamService } from '../services/examService.js';
import { parseQuestionsFromCSV } from '../utils/csvParser.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import Exam from '../models/Exam.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import User from '../models/User.js';
import Result from '../models/Result.js';
import { createQuestionService, updateQuestionService } from '../services/questionService.js';
import Question from '../models/Question.js';
// import { Result } from 'express-validator/lib/validation-result.js';
import Student from '../models/Student.js';
import { Op } from 'sequelize';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {  
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export const createExamValidation = [
  // body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  // body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  // body('examType').isIn(['entrance', 'regular']).withMessage('Invalid exam type'),
  // body('authorId').isUUID().withMessage('Invalid teacher ID'),
  // body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  // body('startDate').isISO8601().withMessage('Invalid start date'),
  // body('endDate').isISO8601().withMessage('Invalid end date'),
];

export const createExam = async (req, res, next) => {
  try {
    const { formData, questions } = req.body;

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      if (!teacher || teacher.id !== formData.authorId) {
        return res.status(403).json({
          success: false,
          message: 'Teachers can only create exams for themselves',
        });
      }
    }

    // 1. Create the exam
    const exam = await ExamService.createExam(formData);

    // 2. Attach examId and create questions
    const createQuestionPromises = questions.map((question) =>
      createQuestionService({
        ...question,
        examId: exam.id,
      })
    );

    await Promise.all(createQuestionPromises);

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

export const getExams = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, status, examType } = req.query;

    let whereClause = {};
    
    // Role-based filtering
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      if (teacher) {
        whereClause.authorId = teacher.id;
      }
    }

    // Additional filters
    if (status) whereClause.status = status;
    if (examType) whereClause.examType = examType;
    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Exam.findAndCountAll({
      where: whereClause,
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Question, as: 'questions' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Remove questions from response
    const exams = rows.map(exam => {
      const examData = exam.toJSON();
      // delete examData.questions;
      return examData;
    });

    const response = createPaginationResponse(exams, count, page, limit);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const getExamAndResult = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { search, status, examType } = req.query;

    // const whereClause = {};

    // Role-based filtering
    // if (req.user.role === 'teacher') {
    //   const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    //   if (teacher) {
    //     whereClause.authorId = teacher.id;
    //   }
    // }

    // if (status) whereClause.status = status;
    // if (examType) whereClause.examType = examType;
    // if (search) {
    //   whereClause.title = { [Op.iLike]: `%${search}%` };
    // }

    const { count, rows } = await Exam.findAndCountAll({
      attributes: ['id', 'examType', 'title', 'createdAt'],
      include: [
        {
          model: Result,
          as: 'results',
          attributes: ['score', 'percentage', 'grade', 'remarks', 'submittedAt'],
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['firstName', 'lastName', 'class'], // Only these fields from User
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });


    const exams = rows.map((exam) => exam.toJSON());
    const response = createPaginationResponse(exams, count, page, limit);

    res.status(200).json({ success: true, ...response });
  } catch (error) {
    console.error('Error fetching exams with results:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeQuestions = req.query.includeQuestions === 'true';
    
    const exam = await ExamService.getExamById(id, includeQuestions);

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {examData} = req.body;

    // Authorization check for teachers
    if (req.user.role === 'teacher') {
      const exam = await Exam.findByPk(id);
      if (exam) {
        const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacher || exam.authorId !== teacher.id) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized to update this exam',
          });
        }
      }
    }

    const exam = await ExamService.updateExam(id, examData);

    // 2. Handle questions update or creation
    const updateOrCreateQuestionPromises = examData.questions.map(async (question) => {
      if (question.id) {
        // Update existing question
        return await updateQuestionService(question.id, question);
      } else {
        // Create new question
        return await createQuestionService({
          ...question,
          examId: exam.id,
        });
      }
    });

    await Promise.all(updateOrCreateQuestionPromises);

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam,
    });

  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization check for teachers
    if (req.user.role === 'teacher') {
      const exam = await Exam.findBypK(id);
      if (exam) {
        const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
        if (!teacher || exam.authorId !== teacher.id) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized to delete this exam',
          });
        }
      }
    }

    await ExamService.deleteExam(id);

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addQuestions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    const exam = await ExamService.addQuestions(id, questions);

    res.status(200).json({
      success: true,
      message: 'Questions added successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

export const importQuestionsFromCSV = [
  upload.single('csvFile'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required',
        });
      }

      const questions = await parseQuestionsFromCSV(req.file.buffer);

      if (questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid questions found in CSV file',
        });
      }

      const exam = await ExamService.addQuestions(id, questions);

      res.status(200).json({
        success: true,
        message: `${questions.length} questions imported successfully`,
        data: exam,
      });
    } catch (error) {
      next(error);
    }
  },
];

export const getExamStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await ExamService.getExamStatistics(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getExamsForStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Students can only access their own exams
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
        });
      }
    }

    const exams = await ExamService.getExamsForStudent(studentId);

    res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};