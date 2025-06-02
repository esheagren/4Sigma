-- Simple user setup script that works with existing table structure
-- Run this in your Supabase SQL Editor

-- Add email column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

-- Add avatar_url column if it doesn't exist  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Now add the creator/editor columns to questions if they don't exist
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS last_edited_by uuid REFERENCES public.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_last_edited_by ON public.questions(last_edited_by);

-- Create the timestamp update trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_question_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_question_timestamp ON public.questions;
CREATE TRIGGER trigger_update_question_timestamp
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_question_timestamp();

-- Insert our test user (only with columns that definitely exist)
INSERT INTO public.users (id, display_name, created_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Test User', 
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Test User';

-- Now update with email if the column exists
UPDATE public.users 
SET email = 'test@example.com'
WHERE id = '550e8400-e29b-41d4-a716-446655440000' 
AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email'
    AND table_schema = 'public'
);

-- Update existing questions to have the test user as creator
UPDATE public.questions 
SET created_by = '550e8400-e29b-41d4-a716-446655440000' 
WHERE created_by IS NULL; 