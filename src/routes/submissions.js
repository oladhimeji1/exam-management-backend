import { Router } from 'express';
import {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  getSubmissionsByExam,
  getSubmissionsByStudent,
  gradeSubmission,
  updateViolations,
} from '../controllers/submissionController.js';
import { authenticate } from '../middleware/auth.js';
import { teacherOrAdmin, studentOnly } from '../middleware/roleAuth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', studentOnly, createSubmission);
router.get('/', teacherOrAdmin, getSubmissions);
router.get('/:id', getSubmissionById);
router.put('/:id', teacherOrAdmin, updateSubmission);
router.get('/exam/:examId', teacherOrAdmin, getSubmissionsByExam);
router.get('/student/:studentId', getSubmissionsByStudent);
router.post('/:id/grade', teacherOrAdmin, gradeSubmission);
router.put('/:id/violations', teacherOrAdmin, updateViolations);

export default router;