import { Router } from 'express';
import {
  getDashboardStats,
  getPerformanceAnalytics,
  getExamAnalytics,
  getStudentAnalytics,
  getClassAnalytics,
  getSubjectAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { teacherOrAdmin, adminOnly } from '../middleware/roleAuth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard/:role', getDashboardStats);
router.post('/performance', teacherOrAdmin, getPerformanceAnalytics);
router.get('/exam/:examId', teacherOrAdmin, getExamAnalytics);
router.get('/student/:studentId', getStudentAnalytics);
router.get('/class/:classId', teacherOrAdmin, getClassAnalytics);
router.get('/subject/:subjectId', teacherOrAdmin, getSubjectAnalytics);

export default router;