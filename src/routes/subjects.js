import { Router } from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsByClass,
  createSubjectValidation,
} from '../controllers/subjectController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly, teacherOrAdmin } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', adminOnly, validate(createSubjectValidation), createSubject);
router.get('/', teacherOrAdmin, getSubjects);
router.get('/:id', teacherOrAdmin, getSubjectById);
router.put('/:id', adminOnly, updateSubject);
router.delete('/:id', adminOnly, deleteSubject);
router.get('/class/:classId', teacherOrAdmin, getSubjectsByClass);

export default router;