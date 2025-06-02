// Vercel serverless function entry point
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CORS configuration
const corsOptions = {
  origin: [
    'https://www.4sig.xyz', 
    'https://4sig.xyz', 
    'https://4-sigma.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Questions endpoints
app.get('/api/questions/daily', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_daily', true)
      .limit(10);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching daily questions:', error);
    res.status(500).json({ error: 'Failed to fetch daily questions' });
  }
});

app.get('/api/questions/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const includeCreator = req.query.includeCreator === 'true';
    const category = req.query.category;
    
    let query = supabase.from('questions').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app; 