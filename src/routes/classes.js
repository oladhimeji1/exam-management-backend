import { Router } from 'express';
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  createClassValidation,
} from '../controllers/classController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly, teacherOrAdmin } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', adminOnly, validate(createClassValidation), createClass);
router.get('/', teacherOrAdmin, getClasses);
router.get('/:id', teacherOrAdmin, getClassById);
router.put('/:id', adminOnly, updateClass);
router.delete('/:id', adminOnly, deleteClass);

export default router;