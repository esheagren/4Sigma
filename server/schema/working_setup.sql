-- Working setup script based on actual table structure
-- Run this in your Supabase SQL Editor

-- STEP 1: Add email column to users table (since it doesn't exist)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

-- STEP 2: Insert our test user with the correct columns
-- (id and display_name are required, created_at has default)
INSERT INTO public.users (id, display_name, email) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Test User',
    'test@example.com'
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Test User',
    email = 'test@example.com';

-- STEP 3: Add creator/editor columns to questions table (without foreign keys first)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS last_edited_by uuid;

-- STEP 4: Add foreign key constraints (now that the user exists)
DO $$
BEGIN
    -- Add foreign key for created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'questions_created_by_fkey'
        AND table_name = 'questions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.questions 
        ADD CONSTRAINT questions_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.users(id);
    END IF;
    
    -- Add foreign key for last_edited_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'questions_last_edited_by_fkey'
        AND table_name = 'questions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.questions 
        ADD CONSTRAINT questions_last_edited_by_fkey 
        FOREIGN KEY (last_edited_by) REFERENCES public.users(id);
    END IF;
END $$;

-- STEP 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_last_edited_by ON public.questions(last_edited_by);

-- STEP 6: Add updated_at column to questions if it doesn't exist
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- STEP 7: Create the timestamp update trigger
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

-- STEP 8: Update existing questions to have the test user as creator
UPDATE public.questions 
SET created_by = '550e8400-e29b-41d4-a716-446655440000' 
WHERE created_by IS NULL; 