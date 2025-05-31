import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';

export const router = express.Router();

router.get('/:userId', getUserProfile);
router.put('/:userId', updateUserProfile);