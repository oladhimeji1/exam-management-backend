import {
  createQuestionService,
  getAllQuestionsService,
  getQuestionByIdService,
  updateQuestionService,
  deleteQuestionService,
} from '../services/questionService.js';

export const createQuestionValidation = [
  // body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  // body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  // body('examType').isIn(['entrance', 'regular']).withMessage('Invalid exam type'),
  // body('authorId').isUUID().withMessage('Invalid teacher ID'),
  // body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  // body('startDate').isISO8601().withMessage('Invalid start date'),
  // body('endDate').isISO8601().withMessage('Invalid end date'),
];

export const createQuestion = async (req, res) => {
  try {
    const question = await createQuestionService(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create question.', error: err.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await getAllQuestionsService();
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await getQuestionByIdService(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching question.' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await updateQuestionService(req.params.id, req.body);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating question.' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const deleted = await deleteQuestionService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.status(200).json({ success: true, message: 'Question deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting question.' });
  }
};
