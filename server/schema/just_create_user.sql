-- Minimal script to just create the test user
-- Run this first to see if user creation works

-- Step 1: Add email column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email text;

-- Step 2: Try to insert the user
INSERT INTO public.users (id, display_name, email) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Test User',
    'test@example.com'
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Test User',
    email = 'test@example.com';

-- Step 3: Verify the user was created
SELECT id, display_name, email, created_at FROM public.users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000'; 