// Vercel serverless function entry point
import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Load environment variables from .env file
dotenv.config();

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

// JWT secret - in production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

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

// ============================================================================
// SCORING UTILITIES
// ============================================================================

/**
 * Calculate the score using KL divergence-inspired scoring system
 */
const calculateScore = ({ lowerBound, upperBound, correctAnswer }) => {
  // Handle edge cases
  if (lowerBound <= 0) lowerBound = 1e-15; // Avoid log(0)
  if (upperBound <= 0) upperBound = 1e-15;
  if (correctAnswer <= 0) correctAnswer = 1e-15;

  // Work in log space to handle large numbers better
  const logLower = Math.log(lowerBound);
  const logUpper = Math.log(upperBound);
  const logX = Math.log(correctAnswer);

  // Calculate penalty based on interval width and correctness
  const intervalWidth = logUpper - logLower;
  const normalizedPosition = (logX - logLower) / intervalWidth;

  // Base penalty from KL divergence formula
  let penalty = Math.log(intervalWidth / 4) + 
                2 * Math.pow((logX - (logLower + logUpper) / 2) / intervalWidth, 2);

  // Add extra penalty if answer is outside the interval
  if (normalizedPosition < 0 || normalizedPosition > 1) {
    const distanceOutside = Math.min(Math.abs(normalizedPosition), Math.abs(normalizedPosition - 1));
    penalty += 5 * distanceOutside;
  }

  // Transform penalty into a 0-100 score
  // Add 1.1 to avoid negative infinity when penalty is very small
  const rawScore = 100 * Math.exp(-penalty - 1.1);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, rawScore));
};

// ============================================================================
// QUESTIONS ENDPOINTS
// ============================================================================

app.get('/api/questions', async (req, res) => {
  try {
    const { category, includeCreator } = req.query;
    
    let selectQuery = `
      id,
      prompt,
      correct_answer,
      version,
      created_at,
      updated_at,
      created_by,
      last_edited_by,
      question_categories (
        categories (
          id,
          slug,
          label
        )
      )
    `;

    // If includeCreator is true, also fetch creator and editor info
    if (includeCreator === 'true') {
      selectQuery = `
        id,
        prompt,
        correct_answer,
        version,
        created_at,
        updated_at,
        created_by,
        last_edited_by,
        creator:users!created_by (
          id,
          display_name,
          avatar_url
        ),
        last_editor:users!last_edited_by (
          id,
          display_name,
          avatar_url
        ),
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `;
    }

    let query = supabase
      .from('questions')
      .select(selectQuery)
      .limit(10);

    // Filter by category if provided
    if (category) {
      query = query.eq('question_categories.categories.slug', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '', // You may want to add a unit field to your schema
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at,
      creator: question.creator ? {
        id: question.creator.id,
        display_name: question.creator.display_name,
        avatar_url: question.creator.avatar_url
      } : null,
      last_editor: question.last_editor ? {
        id: question.last_editor.id,
        display_name: question.last_editor.display_name,
        avatar_url: question.last_editor.avatar_url
      } : null
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/questions/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // For now, we'll get random questions since daily_questions table doesn't exist in your schema
    // You might want to add a daily_questions table or use game_sessions with mode='daily'
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        prompt,
        correct_answer,
        version,
        created_by,
        last_edited_by,
        created_at,
        updated_at,
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `)
      .limit(3);

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '', // You may want to add a unit field to your schema
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching daily questions:', error);
    res.status(500).json({ error: 'Failed to fetch daily questions' });
  }
});

app.get('/api/questions/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('label');

    if (error) throw error;

    // Transform to match frontend expectations
    const transformedData = data.map(category => ({
      id: category.slug,
      name: category.label,
      description: `Questions about ${category.label.toLowerCase()}`,
      icon: 'brain' // Default icon, you might want to add an icon field to your schema
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/questions/creator/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        prompt,
        correct_answer,
        version,
        created_at,
        updated_at,
        created_by,
        last_edited_by,
        creator:users!created_by (
          id,
          display_name,
          avatar_url
        ),
        last_editor:users!last_edited_by (
          id,
          display_name,
          avatar_url
        ),
        question_categories (
          categories (
            id,
            slug,
            label
          )
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedData = data.map(question => ({
      id: question.id.toString(),
      text: question.prompt,
      answer: question.correct_answer,
      unit: '',
      category: question.question_categories[0]?.categories?.label || 'General',
      version: question.version,
      created_by: question.created_by,
      last_edited_by: question.last_edited_by,
      created_at: question.created_at,
      updated_at: question.updated_at,
      creator: question.creator,
      last_editor: question.last_editor
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching questions by creator:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions', async (req, res) => {
  const { prompt, correct_answer, category_ids, created_by } = req.body;
  
  try {
    // Insert the question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert([
        {
          prompt,
          correct_answer,
          created_by,
          version: 1
        }
      ])
      .select()
      .single();

    if (questionError) throw questionError;

    // Link question to categories
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        question_id: questionData.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('question_categories')
        .insert(categoryLinks);

      if (categoryError) throw categoryError;
    }

    res.json({
      id: questionData.id.toString(),
      text: questionData.prompt,
      answer: questionData.correct_answer,
      version: questionData.version,
      created_by: questionData.created_by,
      created_at: questionData.created_at,
      updated_at: questionData.updated_at
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/questions/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const { prompt, correct_answer, category_ids, last_edited_by } = req.body;
  
  try {
    // Get current question to increment version
    const { data: currentQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('version')
      .eq('id', questionId)
      .single();

    if (fetchError) throw fetchError;

    // Update the question
    const updateData = {
      last_edited_by,
      version: currentQuestion.version + 1
    };

    if (prompt !== undefined) updateData.prompt = prompt;
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer;

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (questionError) throw questionError;

    // Update categories if provided
    if (category_ids) {
      // Remove existing category links
      await supabase
        .from('question_categories')
        .delete()
        .eq('question_id', questionId);

      // Add new category links
      if (category_ids.length > 0) {
        const categoryLinks = category_ids.map(categoryId => ({
          question_id: questionId,
          category_id: categoryId
        }));

        const { error: categoryError } = await supabase
          .from('question_categories')
          .insert(categoryLinks);

        if (categoryError) throw categoryError;
      }
    }

    res.json({
      id: questionData.id.toString(),
      text: questionData.prompt,
      answer: questionData.correct_answer,
      version: questionData.version,
      created_by: questionData.created_by,
      last_edited_by: questionData.last_edited_by,
      created_at: questionData.created_at,
      updated_at: questionData.updated_at
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GAME SESSIONS ENDPOINTS
// ============================================================================

app.post('/api/sessions', async (req, res) => {
  const { userId, mode, questionIds } = req.body;
  
  try {
    // Create the game session
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert([
        {
          user_id: userId,
          mode: mode || 'practice'
        }
      ])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Add questions to the session
    if (questionIds && questionIds.length > 0) {
      const sessionQuestions = questionIds.map((questionId, index) => ({
        session_id: sessionData.id,
        question_id: questionId,
        order_idx: index
      }));

      const { error: questionsError } = await supabase
        .from('session_questions')
        .insert(sessionQuestions);

      if (questionsError) throw questionsError;
    }

    res.json(sessionData);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        session_questions (
          order_idx,
          questions (
            id,
            prompt,
            correct_answer,
            question_categories (
              categories (
                label
              )
            )
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    // Transform questions to match frontend expectations
    const transformedSession = {
      ...data,
      questions: data.session_questions
        .sort((a, b) => a.order_idx - b.order_idx)
        .map(sq => ({
          id: sq.questions.id.toString(),
          text: sq.questions.prompt,
          answer: sq.questions.correct_answer,
          unit: '', // You may want to add this to your schema
          category: sq.questions.question_categories[0]?.categories?.label || 'General'
        }))
    };

    delete transformedSession.session_questions;
    res.json(transformedSession);
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions/:sessionId/submit', async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, userId, lowerBound, upperBound, elapsedMs } = req.body;
  
  try {
    // Get the correct answer for scoring
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    // Calculate the score
    const score = calculateScore({
      lowerBound,
      upperBound,
      correctAnswer: questionData.correct_answer
    });

    // Insert the submission
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          session_id: sessionId,
          question_id: questionId,
          user_id: userId,
          lower_bound: lowerBound,
          upper_bound: upperBound,
          elapsed_ms: elapsedMs,
          score
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      correct_answer: questionData.correct_answer
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions/:sessionId/finish', async (req, res) => {
  const { sessionId } = req.params;
  const { durationMs } = req.body;
  
  try {
    // Get all submissions for this session
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('score')
      .eq('session_id', sessionId);

    if (submissionsError) throw submissionsError;

    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const questionsAnswered = submissions.length;

    // Insert session results
    const { data, error } = await supabase
      .from('session_results')
      .insert([
        {
          session_id: sessionId,
          total_score: totalScore,
          questions_answered: questionsAnswered,
          finished_at: new Date(),
          duration_ms: durationMs
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      submissions
    });
  } catch (error) {
    console.error('Error finishing game session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        session_results (
          total_score,
          questions_answered,
          finished_at,
          duration_ms
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SCORES ENDPOINTS
// ============================================================================

app.post('/api/scores/submit', async (req, res) => {
  const { userId, questionId, answer, score } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          lower_bound: answer.lowerBound,
          upper_bound: answer.upperBound,
          score: score,
          submitted_at: new Date()
        }
      ]);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scores/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        score,
        lower_bound,
        upper_bound,
        created_at,
        questions (
          prompt,
          correct_answer
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalAttempts: data.length,
      averageScore: data.reduce((acc, curr) => acc + curr.score, 0) / data.length || 0,
      scoreDistribution: {
        excellent: data.filter(s => s.score >= 90).length,
        good: data.filter(s => s.score >= 70 && s.score < 90).length,
        fair: data.filter(s => s.score >= 50 && s.score < 70).length,
        poor: data.filter(s => s.score < 50).length
      },
      recentScores: data.slice(0, 10).map(submission => ({
        score: submission.score,
        date: submission.created_at,
        question: submission.questions.prompt,
        interval: [submission.lower_bound, submission.upper_bound],
        correctAnswer: submission.questions.correct_answer
      }))
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// USERS ENDPOINTS
// ============================================================================

app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Sign up (email/password)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Validate input
    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Simple check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Direct insert with minimal fields
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          username,
          display_name: displayName,
          password_hash: hashedPassword,
          provider: 'email',
          provider_id: email,
          email_verified: true,
          last_sign_in_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error with direct insert:', insertError);
      return res.status(500).json({ 
        message: 'Failed to create user',
        error: insertError.message,
        details: insertError.details 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        username: newUser.username,
        provider: 'email'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.display_name,
      avatarUrl: newUser.avatar_url,
      provider: 'email',
    };

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Sign in (email/password)
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email and email provider
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('provider', 'email')
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last sign in
    await supabase
      .from('users')
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        provider: user.provider
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      provider: user.provider,
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, provider')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      provider: user.provider,
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app; 