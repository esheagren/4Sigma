-- Add authentication fields to users table
-- Run this in your Supabase SQL Editor

-- Add username and password_hash columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Add constraints
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS users_username_unique UNIQUE (username);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update the test user to have authentication fields
UPDATE public.users 
SET 
    username = 'testuser',
    email = 'test@example.com'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 