import ExamSubmission from '../models/ExamSubmission.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateGrade, getRemarks, calculatePercentage } from '../utils/gradeCalculator.js';
import Question from '../models/Question.js';

export class GradingService {
  static async autoGradeSubmission(submissionId) {
    const submission = await ExamSubmission.findByPk(submissionId, {
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: Question,
              as: 'questions',
            },
          ],
        },
      ],
    });


    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    if (!submission.exam) {
      throw new AppError('Exam not found for submission', 404);
    }

    const questions = submission.exam.questions;
    const studentAnswers = submission.answers;

    let totalScore = 0;
    let autoGradedQuestions = 0;

    // Grade multiple choice questions
    studentAnswers.forEach((studentAnswer) => {
      const examQuestion = questions.find(q => q.id === studentAnswer.questionId);

      if (!examQuestion) return;

      if (examQuestion.type === 'multiple_choice') {
        if (studentAnswer.answer === examQuestion.correct_answer) {
          totalScore += examQuestion.point;
        }
        autoGradedQuestions++;
      }
    });

    // Only update if all questions are multiple choice (fully auto-gradable)
    const totalQuestions = questions.length;
    const isFullyAutoGradable = autoGradedQuestions === totalQuestions;

    if (isFullyAutoGradable) {
      await submission.update({
        score: totalScore,
        status: 'graded',
        gradedAt: new Date(),
      });

      // Create result
      await this.createResult(submission);
    }

    return {
      autoGraded: isFullyAutoGradable,
      score: isFullyAutoGradable ? totalScore : null,
      questionsGraded: autoGradedQuestions,
      totalQuestions,
    };
  }

  static async createResult(submission) {
    if (!submission.exam || submission.exam.totalPoints == null) {
      const exam = await Exam.findByPk(submission.examId, {
        attributes: ['id', 'totalPoints'],
      });

      if (!exam || exam.totalPoints == null) {
        throw new Error('Exam or totalPoints not found.');
      }

      submission.exam = exam;
    }

    const percentage = calculatePercentage(submission.score, submission.exam.totalPoints);
    const grade = calculateGrade(percentage);
    const remarks = getRemarks(percentage);

    // Check if result already exists
    const existingResult = await Result.findOne({
      where: {
        examId: submission.examId,
        studentId: submission.studentId,
      },
    });

    const resultData = {
      score: submission.score,
      totalPoints: submission.exam.totalPoints,
      percentage,
      grade,
      remarks,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
    };

    if (existingResult) {
      await existingResult.update(resultData);
      return existingResult;
    } else {
      return await Result.create({
        examId: submission.examId,
        studentId: submission.studentId,
        ...resultData,
      });
    }
  }

  static async bulkGradeSubmissions(
    examId,
    grades
  ) {
    const results = [];

    for (const gradeData of grades) {
      try {
        const submission = await ExamSubmission.findByPk(gradeData.submissionId);

        if (submission && submission.examId === examId) {
          await submission.update({
            score: gradeData.score,
            feedback: gradeData.feedback,
            status: 'graded',
            gradedAt: new Date(),
          });

          await this.createResult(submission);
          results.push({ submissionId: gradeData.submissionId, success: true });
        } else {
          results.push({ 
            submissionId: gradeData.submissionId, 
            success: false, 
            error: 'Submission not found or exam mismatch' 
          });
        }
      } catch (error) {
        results.push({ 
          submissionId: gradeData.submissionId, 
          success: false, 
          error: error.message 
        });
      }
    }

    return results;
  }

  static calculateDetailedGrading(questions, answers) {
    const gradingDetails = {
      totalQuestions: questions.length,
      correct_answers: 0,
      incorrect_answers: 0,
      unanswered: 0,
      totalScore: 0,
      maxScore: 0,
      questionBreakdown,
    };

    questions.forEach((question) => {
      gradingDetails.maxScore += question.point;
      const studentAnswer = answers[question.id];

      if (!studentAnswer) {
        gradingDetails.unanswered++;
        gradingDetails.questionBreakdown.push({
          questionId: question.id,
          type: question.type,
          points: question.point,
          scored: 0,
          correct: false,
        });
        return;
      }

      let isCorrect = false;
      let scored = 0;

      if (question.type === 'multiple_choice') {
        isCorrect = studentAnswer.answer === question.correct_answer;
        scored = isCorrect ? question.point : 0;
      }
      // Theory questions need manual grading, so we don't score them here

      if (isCorrect) {
        gradingDetails.correct_answers++;
        gradingDetails.totalScore += scored;
      } else {
        gradingDetails.incorrect_answers++;
      }

      gradingDetails.questionBreakdown.push({
        questionId: question.id,
        type: question.type,
        points: question.point,
        scored,
        correct: isCorrect,
      });
    });

    return gradingDetails;
  }
}