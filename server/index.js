import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { router as questionsRouter } from './routes/questions.js';
import { router as scoresRouter } from './routes/scores.js';
import { router as usersRouter } from './routes/users.js';
import { router as sessionsRouter } from './routes/sessions.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/questions', questionsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}