import express from 'express';
import { 
  getQuestions, 
  getDailyQuestions, 
  getCategories, 
  createQuestion, 
  updateQuestion, 
  getQuestionsByCreator 
} from '../controllers/questionController.js';

export const router = express.Router();

router.get('/', getQuestions);
router.get('/daily', getDailyQuestions);
router.get('/categories', getCategories);
router.get('/creator/:userId', getQuestionsByCreator);
router.post('/', createQuestion);
router.put('/:questionId', updateQuestion);