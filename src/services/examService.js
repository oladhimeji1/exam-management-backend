import { Op } from 'sequelize';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import { AppError } from '../middleware/errorHandler.js';
import { sequelize } from '../config/database.js';

export class ExamService {
  static async createExam(examData) {
    // const { title, description, examType, subjectId, classId, teacherId, duration, startDate, endDate, } = endDate
    // Validate dates
    if (new Date(examData.startDate) >= new Date(examData.endDate)) {
      throw new AppError('End date must be after start date', 400);
    }

    const exam = await Exam.create(examData);
    return exam;
  }

  static async updateExam(examId, updateData) {
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Don't allow updates if exam is active or completed
    if (exam.status === 'active' || exam.status === 'completed') {
      throw new AppError('Cannot update active or completed exam', 400);
    }

    await exam.update(updateData);
    return exam;
  }

  static async deleteExam(examId) {
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Check if there are any submissions
    const submissionCount = await ExamSubmission.count({ where: { examId } });

    if (submissionCount > 0) {
      throw new AppError('Cannot delete exam with existing submissions', 400);
    }

    await exam.destroy();
  }

  static async getExamById(examId, includeQuestions = false) {
    const exam = await Exam.findByPk(examId, {
      include: [
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
      ],
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const examData = exam.toJSON();

    // Remove questions if not requested or if exam is not active
    if (!includeQuestions || exam.status !== 'active') {
      delete examData.questions;
    }

    return examData;
  }

  static async getExamsForStudent(studentId) {
    const student = await Student.findByPk(studentId);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const currentDate = new Date();

    const exams = await Exam.findAll({
      where: {
        [Op.or]: [
          { classId: student.classId },
          { examType: 'entrance' },
        ],
        status: { [Op.in]: ['published', 'active'] },
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate },
      },
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user' }] },
      ],
      order: [['startDate', 'ASC']],
    });

    // Remove questions from response
    return exams.map(exam => {
      const examData = exam.toJSON();
      delete examData.questions;
      return examData;
    });
  }

  static async addQuestions(examId, questions) {
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    if (exam.status === 'active' || exam.status === 'completed') {
      throw new AppError('Cannot modify questions of active or completed exam', 400);
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    await exam.update({
      questions,
      totalPoints,
    });

    return exam;
  }

  static async updateExamStatus(examId, status) {
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Validate status transition
    const validTransitions = {
      draft: ['published'],
      published: ['active', 'draft'],
      active: ['completed'],
      completed: [],
    };

    if (!validTransitions[exam.status].includes(status)) {
      throw new AppError(`Cannot change status from ${exam.status} to ${status}`, 400);
    }

    await exam.update({ status });
    return exam;
  }

  static async getExamStatistics(examId) {
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const totalSubmissions = await ExamSubmission.count({ where: { examId } });
    const gradedSubmissions = await ExamSubmission.count({
      where: { examId, status: 'graded' },
    });

    const averageScore = await ExamSubmission.findOne({
      where: { examId, score: { [Op.not]: null } },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
      ],
    });

    return {
      totalSubmissions,
      gradedSubmissions,
      pendingGrading: totalSubmissions - gradedSubmissions,
      averageScore: averageScore?.get('averageScore') || 0,
    };
  }
}