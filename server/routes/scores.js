import express from 'express';
import { submitScore, getUserStats } from '../controllers/scoreController.js';

export const router = express.Router();

router.post('/submit', submitScore);
router.get('/stats/:userId', getUserStats);