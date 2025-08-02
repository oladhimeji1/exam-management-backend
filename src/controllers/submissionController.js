import { body } from 'express-validator';
import { SubmissionService } from '../services/submissionService.js';
import { getPaginationOptions, createPaginationResponse } from '../utils/pagination.js';
import Student from '../models/Student.js';

export const createSubmissionValidation = [
  body('examId').isUUID().withMessage('Invalid exam ID'),
  body('studentId').isUUID().withMessage('Invalid student ID'),
  body('answers').isObject().withMessage('Answers must be an object'),
];

export const createSubmission = async (req, res, next) => {
  try {
    const { examId, studentId, answers } = req.body;

    var id;
    // Students can only submit for themselves
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      id = student.id
      if (!student || student.userId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to submit for this student',
        });
      }
    }

    const submission = await SubmissionService.submitExam(examId, studentId, answers, id);

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationOptions(req);
    const { examId, studentId, status } = req.query;

    // Implementation would go here
    res.status(200).json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await SubmissionService.getSubmissionById(id);

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Implementation would go here
    
    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const includeAnswers = req.query.includeAnswers === 'true';
    
    const submissions = await SubmissionService.getSubmissionsByExam(examId, includeAnswers);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Students can only access their own submissions
    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student || student.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
        });
      }
    }

    const submissions = await SubmissionService.getSubmissionsByStudent(studentId);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const submission = await SubmissionService.gradeSubmission(id, score, feedback, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const updateViolations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { violations } = req.body;

    const submission = await SubmissionService.updateViolations(id, violations);

    res.status(200).json({
      success: true,
      message: 'Violations updated successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};