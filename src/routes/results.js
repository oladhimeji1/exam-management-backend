import { Router } from 'express';
import {
  getResults,
  getResultById,
  getResultsByStudent,
  getResultsByExam,
  getResultsByClass,
  getResultsBySubject,
  generateReport,
  exportToPDF,
  exportToCSV,
} from '../controllers/resultController.js';
import { authenticate } from '../middleware/auth.js';
import { teacherOrAdmin } from '../middleware/roleAuth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getResults);
router.get('/:id', getResultById);
router.get('/student/:studentId', getResultsByStudent);
router.get('/exam/:examId', teacherOrAdmin, getResultsByExam);
router.get('/class/:classId', teacherOrAdmin, getResultsByClass);
router.get('/subject/:subjectId', teacherOrAdmin, getResultsBySubject);
router.post('/report', teacherOrAdmin, generateReport);
router.post('/export/pdf', teacherOrAdmin, exportToPDF);
router.post('/export/csv', teacherOrAdmin, exportToCSV);

export default router;