import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,  
  createQuestionValidation
} from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';
import { teacherOrAdmin, adminOnly } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';
// import createQuestionValidation from '../controllers/questionController.js';
// import deleteQuestion from '../controllers/questionController.js';
// import { createQuestion } from '../controllers/questionController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', teacherOrAdmin, validate(createQuestionValidation), createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.put('/:id', teacherOrAdmin, updateQuestion);
router.delete('/:id', teacherOrAdmin, deleteQuestion);

export default router;