-- Alternative approach: Use existing user or create without foreign key constraints
-- Run this in your Supabase SQL Editor

-- Step 1: Check what users already exist
SELECT id, display_name, created_at FROM public.users LIMIT 5;

-- Step 2: Add email column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

-- Step 3: Add creator/editor columns to questions WITHOUT foreign key constraints
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS created_by uuid;

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS last_edited_by uuid;

-- Step 4: Add updated_at column to questions if it doesn't exist
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Step 5: Create the timestamp update trigger
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

-- Step 6: If there are existing users, use the first one as creator
-- Otherwise, we'll update this manually later
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Get the first existing user
    SELECT id INTO existing_user_id FROM public.users LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Update existing questions to have this user as creator
        UPDATE public.questions 
        SET created_by = existing_user_id 
        WHERE created_by IS NULL;
        
        RAISE NOTICE 'Updated questions with existing user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. You will need to create a user first.';
    END IF;
END $$; 