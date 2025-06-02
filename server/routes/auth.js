import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';

const router = express.Router();

// JWT secret - in production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
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

// Sign up (email/password)
router.post('/signup', async (req, res) => {
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
router.post('/signin', async (req, res) => {
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

// OAuth callback handler (for future OAuth integration)
router.post('/oauth/callback', async (req, res) => {
  try {
    const { email, displayName, avatarUrl, provider, providerId } = req.body;

    if (!email || !provider || !providerId) {
      return res.status(400).json({ message: 'Missing required OAuth data' });
    }

    // Use the database function to handle OAuth user creation/update
    const { data: result, error } = await supabase
      .rpc('handle_oauth_user', {
        p_email: email,
        p_display_name: displayName,
        p_avatar_url: avatarUrl,
        p_provider: provider,
        p_provider_id: providerId
      });

    if (error) {
      console.error('OAuth user creation error:', error);
      return res.status(500).json({ message: 'Failed to process OAuth user' });
    }

    // Fetch the complete user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', result)
      .single();

    if (fetchError || !user) {
      return res.status(500).json({ message: 'Failed to fetch user data' });
    }

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

    // Return user data and token
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
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user (verify token)
router.get('/me', authenticateToken, async (req, res) => {
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

export { router }; 