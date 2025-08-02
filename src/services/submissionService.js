import ExamSubmission from '../models/ExamSubmission.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';
// import Result from '../models/Result.js';
import { AppError } from '../middleware/errorHandler.js';
import { GradingService } from './gradingService.js';

export class SubmissionService {
  static async submitExam(examId, studentId, answers, id) {
    // Check if exam exists and is active
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    if (exam.status !== 'published') {
      throw new AppError('Exam is not active', 400);
    }

    // Check if exam is within time limits
    // const currentDate = new Date();
    // if (currentDate < exam.startDate || currentDate > exam.endDate) {
    //   throw new AppError('Exam is not available at this time', 400);
    // }

    // Check if student has already submitted
    const existingSubmission = await ExamSubmission.findOne({
      where: { examId, id },
    });

    if (existingSubmission) {
      throw new AppError('Exam already submitted', 400);
    }

    // Create submission
    const submission = await ExamSubmission.create({
      examId,
      studentId: id,
      answers,
      submittedAt: new Date(),
      status: 'submitted',
    });

    // Auto-grade if possible (multiple choice questions)
    try {
      await GradingService.autoGradeSubmission(submission.id);
    } catch (error) {
      console.error('Auto-grading failed:', error);
    }

    return submission;
  }

  static async getSubmissionById(submissionIduser) {
    const submission = await ExamSubmission.findByPk(submissionId, {
      include: [
        { model: Exam, as: 'exam' },
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'grader' },
      ],
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    return submission;
  }

  static async gradeSubmission(
    submissionIduser,
    score,
    feedbackuser,
    gradedByuser
  ) {
    const submission = await ExamSubmission.findByPk(submissionId, {
      include: [{ model: Exam, as: 'exam' }],
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    if (submission.status === 'graded') {
      throw new AppError('Submission already graded', 400);
    }

    // Update submission
    await submission.update({
      score,
      feedback,
      gradedBy,
      gradedAt: new Date(),
      status: 'graded',
    });

    // Create or update result
    await GradingService.createResult(submission);

    return submission;
  }

  static async getSubmissionsByExam(examIduser, includeAnswers = false) {
    const submissions = await ExamSubmission.findAll({
      where: { examId },
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'grader' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    if (!includeAnswers) {
      return submissions.map(submission => {
        const submissionData = submission.toJSON();
        delete submissionData.answers;
        return submissionData;
      });
    }

    return submissions;
  }

  static async getSubmissionsByStudent(studentIduser) {
    const submissions = await ExamSubmission.findAll({
      where: { studentId },
      include: [
        { model: Exam, as: 'exam' },
      ],
      order: [['submittedAt', 'DESC']],
    });

    // Remove answers from response for security
    return submissions.map(submission => {
      const submissionData = submission.toJSON();
      delete submissionData.answers;
      return submissionData;
    });
  }

  static async updateViolations(submissionIduser, violations) {
    const submission = await ExamSubmission.findByPk(submissionId);

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    await submission.update({ violations });
    return submission;
  }
}