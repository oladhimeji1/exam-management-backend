import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Result from '../models/Result.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { role } = req.params;
    let stats = {};

    switch (role) {
      case 'admin':
        stats = await getAdminDashboardStats();
        break;
      case 'teacher':
        stats = await getTeacherDashboardStats(req.user.id);
        break;
      case 'student':
        stats = await getStudentDashboardStats(req.user.id);
        break;
      default:
        throw new AppError('Invalid role specified', 400);
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboardStats = async () => {
  const [
    totalStudents,
    totalTeachers,
    totalExams,
    totalSubmissions,
  ] = await Promise.all([
    Student.count(),
    Teacher.count(),
    Exam.count(),
    ExamSubmission.count(),
  ]);

  const recentExams = await Exam.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Subject, as: 'subject' },
      { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
    ],
  });

  return {
    totalStudents,
    totalTeachers,
    totalExams,
    totalSubmissions,
    recentExams,
  };
};

const getTeacherDashboardStats = async (userId) => {
  const teacher = await Teacher.findOne({ where: { userId } });
  
  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  const [
    totalExams,
    totalSubmissions,
  ] = await Promise.all([
    Exam.count({ where: { teacherId: teacher.id } }),
    ExamSubmission.count({
      include: [{ model: Exam, as: 'exam', where: { teacherId: teacher.id } }],
    }),
  ]);

  const recentExams = await Exam.findAll({
    where: { teacherId: teacher.id },
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: Subject, as: 'subject' }],
  });

  return {
    totalExams,
    totalSubmissions,
    recentExams,
  };
};

const getStudentDashboardStats = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const [
    totalSubmissions,
    totalResults,
  ] = await Promise.all([
    ExamSubmission.count({ where: { studentId: student.id } }),
    Result.count({ where: { studentId: student.id } }),
  ]);

  const recentResults = await Result.findAll({
    where: { studentId: student.id },
    limit: 5,
    order: [['gradedAt', 'DESC']],
    include: [
      { model: Exam, as: 'exam', include: [{ model: Subject, as: 'subject' }] },
    ],
  });

  return {
    totalSubmissions,
    recentExams: recentResults,
  };
};

export const getPerformanceAnalytics = async (req, res, next) => {
  try {
    const filters = req.body;
    
    // Implementation for performance analytics would go here
    res.status(200).json({
      success: true,
      message: 'Performance analytics retrieved successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getExamAnalytics = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const [
      totalSubmissions,
      averageScore,
      highestScore,
      lowestScore,
    ] = await Promise.all([
      ExamSubmission.count({ where: { examId } }),
      ExamSubmission.findOne({
        where: { examId, score: { [Op.not]: null } },
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'average']],
      }),
      ExamSubmission.max('score', { where: { examId } }),
      ExamSubmission.min('score', { where: { examId, score: { [Op.not]: null } } }),
    ]);

    const gradeDistribution = await Result.findAll({
      where: { examId },
      attributes: [
        'grade',
        [sequelize.fn('COUNT', sequelize.col('grade')), 'count'],
      ],
      group: ['grade'],
    });

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        averageScore: averageScore?.get('average') || 0,
        highestScore: highestScore || 0,
        lowestScore: lowestScore || 0,
        gradeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAnalytics = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Students can only access their own analytics
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
        { model: Exam, as: 'exam', include: [{ model: Subject, as: 'subject' }] },
      ],
      order: [['gradedAt', 'ASC']],
    });

    const performanceData = results.map(result => ({
      examTitle: result.exam.title,
      subject: result.exam.subject?.name,
      percentage: result.percentage,
      grade: result.grade,
      date: result.gradedAt,
    }));

    const averagePercentage = results.length > 0 
      ? results.reduce((sum, result) => sum + result.percentage, 0) / results.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalExams: results.length,
        averagePercentage,
        performanceData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClassAnalytics = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findByPk(classId);
    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    const results = await Result.findAll({
      include: [
        { 
          model: Student, 
          as: 'student',
          where: { classId },
          include: [{ model: User, as: 'user' }]
        },
        { 
          model: Exam, 
          as: 'exam',
          include: [{ model: Subject, as: 'subject' }]
        },
      ],
    });

    const averagePercentage = results.length > 0 
      ? results.reduce((sum, result) => sum + result.percentage, 0) / results.length
      : 0;

    const subjectPerformance = results.reduce((acc, result) => {
      const subjectName = result.exam.subject?.name || 'Unknown';
      if (!acc[subjectName]) {
        acc[subjectName] = { total: 0, count: 0 };
      }
      acc[subjectName].total += result.percentage;
      acc[subjectName].count += 1;
      return acc;
    }, {});

    Object.keys(subjectPerformance).forEach(subject => {
      subjectPerformance[subject].average = 
        subjectPerformance[subject].total / subjectPerformance[subject].count;
    });

    res.status(200).json({
      success: true,
      data: {
        className: classData.name,
        totalStudents: classData.studentsCount,
        totalResults: results.length,
        averagePercentage,
        subjectPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectAnalytics = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const results = await Result.findAll({
      include: [
        { 
          model: Exam, 
          as: 'exam',
          where: { subjectId }
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

    const averagePercentage = results.length > 0 
      ? results.reduce((sum, result) => sum + result.percentage, 0) / results.length
      : 0;

    const classPerformance = results.reduce((acc, result) => {
      const className = result.student.class?.name || 'Unknown';
      if (!acc[className]) {
        acc[className] = { total: 0, count: 0 };
      }
      acc[className].total += result.percentage;
      acc[className].count += 1;
      return acc;
    }, {});

    Object.keys(classPerformance).forEach(className => {
      classPerformance[className].average = 
        classPerformance[className].total / classPerformance[className].count;
    });

    res.status(200).json({
      success: true,
      data: {
        subjectName: subject.name,
        subjectCode: subject.code,
        totalResults: results.length,
        averagePercentage,
        classPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};