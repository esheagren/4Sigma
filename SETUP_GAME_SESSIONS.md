# Game Session Setup Guide

## Overview

Your application now uses a proper game session system that saves all answers and scores to your Supabase database. Here's how to set it up and test it.

## Step 1: Run the Database Setup Script

In your Supabase SQL Editor, run the following script:

```sql
-- Setup script for testing the game session system
-- Run this in your Supabase SQL Editor

-- First, add the creator/editor columns if they don't exist
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

-- Insert a test user (using a proper UUID)
INSERT INTO public.users (id, display_name, created_at) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test User', NOW())
ON CONFLICT (id) DO UPDATE SET display_name = 'Test User';

-- Update existing questions to have the test user as creator
UPDATE public.questions 
SET created_by = '550e8400-e29b-41d4-a716-446655440000' 
WHERE created_by IS NULL;
```

## Step 2: Verify Your Servers Are Running

Make sure both servers are running:

- **Backend**: `node server/index.js` (port 3000)
- **Frontend**: `npx vite` (port 5173)

## Step 3: Test the Game Session System

1. **Open your application**: Navigate to http://localhost:5173
2. **Go to Daily Play**: Click on "Daily Play" in the navigation
3. **Answer questions**: The system will now:
   - Create a game session in the database
   - Save each answer with score and elapsed time
   - Track the complete game session

## What Happens Now

### When you start a game:
1. **Game Session Created**: A new record in `game_sessions` table
2. **Questions Linked**: Questions are linked to the session in `session_questions`
3. **Timer Started**: Tracks total game duration

### When you answer each question:
1. **Answer Submitted**: Saved to `submissions` table with:
   - Your confidence interval (lower/upper bounds)
   - Calculated score using the KL divergence algorithm
   - Time taken to answer the question
   - Timestamp

### When you finish the game:
1. **Session Completed**: Final results saved to `session_results` table
2. **Total Score Calculated**: Sum of all question scores
3. **Duration Recorded**: Total time for the entire session

## Database Tables Used

### `game_sessions`
- Tracks each game you play
- Records start time and game mode (daily/practice/custom)

### `session_questions`
- Links questions to each game session
- Maintains question order

### `submissions`
- Stores every answer you submit
- Includes confidence intervals, scores, and timing

### `session_results`
- Final results for completed games
- Total score, questions answered, duration

## Viewing Your Data

You can check your Supabase database to see:

1. **Game Sessions**: 
   ```sql
   SELECT * FROM game_sessions ORDER BY started_at DESC;
   ```

2. **Your Submissions**:
   ```sql
   SELECT s.*, q.prompt, q.correct_answer 
   FROM submissions s 
   JOIN questions q ON s.question_id = q.id 
   ORDER BY s.created_at DESC;
   ```

3. **Session Results**:
   ```sql
   SELECT * FROM session_results ORDER BY finished_at DESC;
   ```

## Testing the System

1. **Play a complete game** on the Daily Play page
2. **Check your database** - you should see:
   - A new game session
   - Submissions for each question you answered
   - A session result when you complete the game

## Troubleshooting

### If you get UUID errors:
- Make sure you ran the database setup script
- The test user UUID must be exactly: `550e8400-e29b-41d4-a716-446655440000`

### If answers aren't saving:
- Check browser console for errors
- Verify both servers are running
- Check that the Vite proxy is working (you should see API calls in network tab)

### If you get database errors:
- Ensure your Supabase credentials are correct in `.env`
- Verify the database schema was created properly
- Check Supabase logs for detailed error messages

## Next Steps

Once this is working, you can:
1. **Add real user authentication** with Supabase Auth
2. **View game history** in the profile dashboard
3. **Create custom question sets** using the question management interface
4. **Add leaderboards** and social features

The foundation is now in place for a fully functional game with persistent data storage! 