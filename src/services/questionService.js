import Question from '../models/Question.js';

export const createQuestionService = async (data) => {
  return await Question.create(data);
};

export const getAllQuestionsService = async () => {
  return await Question.findAll();
};

export const getQuestionByIdService = async (id) => {
  return await Question.findByPk(id);
};

export const updateQuestionService = async (id, updates) => {
  const question = await Question.findByPk(id);
  if (!question) return null;
  return await question.update(updates);
};

export const deleteQuestionService = async (id) => {
  const question = await Question.findByPk(id);
  if (!question) return null;
  await question.destroy();
  return true;
};
