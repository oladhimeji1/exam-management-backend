import { Router } from 'express';
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  addQuestions,
  importQuestionsFromCSV,
  getExamStatistics,
  getExamsForStudent,
  createExamValidation,
  getExamAndResult,
} from '../controllers/examController.js';
import { authenticate } from '../middleware/auth.js';
import { teacherOrAdmin, adminOnly } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', teacherOrAdmin, validate(createExamValidation), createExam);
router.get('/', getExams);
router.get('/result/exams', getExamAndResult);
router.get('/:id', getExamById);
router.put('/:id', teacherOrAdmin, updateExam);
router.delete('/:id', teacherOrAdmin, deleteExam);

router.post('/:id/questions', teacherOrAdmin, addQuestions);
router.post('/:id/questions/import-csv', teacherOrAdmin, importQuestionsFromCSV);

router.get('/:id/statistics', teacherOrAdmin, getExamStatistics);
router.get('/student/:studentId', getExamsForStudent);

export default router;