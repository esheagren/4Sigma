import express from 'express';
import { getQuestions, getDailyQuestions } from '../controllers/questionController.js';

export const router = express.Router();

router.get('/', getQuestions);
router.get('/daily', getDailyQuestions);