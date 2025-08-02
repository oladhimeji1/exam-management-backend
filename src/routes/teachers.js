import { Router } from 'express';
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeachersBySubject,
  createTeacherValidation,
} from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', adminOnly, validate(createTeacherValidation), createTeacher);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', adminOnly, updateTeacher);
router.delete('/:id', adminOnly, deleteTeacher);
router.get('/subject/:subjectId', getTeachersBySubject);

export default router;