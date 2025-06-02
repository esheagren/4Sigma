import express from 'express';
import { 
  createGameSession, 
  getGameSession, 
  submitAnswer, 
  finishGameSession, 
  getUserSessions 
} from '../controllers/gameSessionController.js';

export const router = express.Router();

router.post('/', createGameSession);
router.get('/:sessionId', getGameSession);
router.post('/:sessionId/submit', submitAnswer);
router.post('/:sessionId/finish', finishGameSession);
router.get('/user/:userId', getUserSessions); 