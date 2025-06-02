-- Migration: Add creator and editor tracking to questions table
-- Run this after your main schema is set up

-- Add new columns to questions table
ALTER TABLE public.questions 
ADD COLUMN created_by uuid REFERENCES public.users(id),
ADD COLUMN last_edited_by uuid REFERENCES public.users(id);

-- Update existing questions to have a default creator (you can change this UUID to a real user)
-- For now, we'll leave them NULL since we don't have real users yet
-- UPDATE public.questions SET created_by = 'some-uuid-here' WHERE created_by IS NULL;

-- Create an index for better performance when querying by creator
CREATE INDEX idx_questions_created_by ON public.questions(created_by);
CREATE INDEX idx_questions_last_edited_by ON public.questions(last_edited_by);

-- Optional: Add a trigger to automatically update the updated_at timestamp when last_edited_by changes
CREATE OR REPLACE FUNCTION update_question_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_timestamp
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_question_timestamp(); 