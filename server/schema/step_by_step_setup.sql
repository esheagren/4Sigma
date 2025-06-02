-- Step-by-step setup script
-- Run this in your Supabase SQL Editor

-- STEP 1: Add missing columns to users table (without constraints)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- STEP 2: Insert our test user FIRST (before adding foreign keys)
INSERT INTO public.users (id, display_name, created_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Test User', 
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Test User';

-- STEP 3: Update with email if the column exists
UPDATE public.users 
SET email = 'test@example.com'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- STEP 4: Now add the creator/editor columns to questions (NOW the user exists)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS last_edited_by uuid;

-- STEP 5: Add the foreign key constraints AFTER the user exists
DO $$
BEGIN
    -- Add foreign key for created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'questions_created_by_fkey'
        AND table_name = 'questions'
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
    ) THEN
        ALTER TABLE public.questions 
        ADD CONSTRAINT questions_last_edited_by_fkey 
        FOREIGN KEY (last_edited_by) REFERENCES public.users(id);
    END IF;
END $$;

-- STEP 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_last_edited_by ON public.questions(last_edited_by);

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