import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { router as questionsRouter } from './routes/questions.js';
import { router as scoresRouter } from './routes/scores.js';
import { router as usersRouter } from './routes/users.js';
import { router as sessionsRouter } from './routes/sessions.js';
import { router as authRouter } from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file or environment configuration.');
  if (!isProduction) {
    process.exit(1);
  }
}

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Only log in development
if (isDevelopment) {
  console.log(`🚀 Starting server in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL}`);
}

// CORS configuration
const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:3001']
    : ['https://www.4sig.xyz', 'https://4sig.xyz', 'https://4-sigma.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/questions', questionsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/auth', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// For local development
if (isDevelopment) {
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  });
}

// Export for Vercel serverless functions
export default app;