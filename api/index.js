// Vercel serverless function entry point
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// CORS configuration
app.use(cors({
  origin: [
    'https://www.4sig.xyz', 
    'https://4sig.xyz', 
    'https://4-sigma.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Root route
app.get("/", (req, res) => res.send("4Sigma API on Vercel"));

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
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    
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

module.exports = app; 