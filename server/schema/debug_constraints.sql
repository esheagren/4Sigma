-- Debug foreign key constraints on users table
-- Run this in your Supabase SQL Editor to see what constraints exist

-- Check all constraints on the users table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.table_name = 'users' 
    AND tc.table_schema = 'public';

-- Also check the current table structure
\d public.users;

-- Test if we can insert a simple record directly
INSERT INTO public.users (
    email,
    username,
    display_name,
    password_hash,
    provider,
    provider_id,
    email_verified,
    last_sign_in_at
) VALUES (
    'direct@test.com',
    'directtest',
    'Direct Test',
    'dummy_hash',
    'email',
    'direct@test.com',
    true,
    NOW()
) RETURNING id, email, username; 