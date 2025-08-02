import { Router } from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  createStudentValidation,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly, teacherOrAdmin } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', adminOnly, validate(createStudentValidation), createStudent);
router.get('/', teacherOrAdmin, getStudents);
router.get('/:id', teacherOrAdmin, getStudentById);
router.put('/:id', adminOnly, updateStudent);
router.delete('/:id', adminOnly, deleteStudent);
router.get('/class/:classId', teacherOrAdmin, getStudentsByClass);

export default router;