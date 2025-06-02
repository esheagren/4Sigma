-- Fix foreign key constraint issue on users table
-- Run this in your Supabase SQL Editor

-- First, let's see what foreign key constraints exist
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
    AND tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Drop the problematic foreign key constraint
-- This is likely a self-referencing constraint that's not needed
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Test if we can now insert a user
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
    'test-fix@example.com',
    'testfix',
    'Test Fix User',
    'dummy_hash',
    'email',
    'test-fix@example.com',
    true,
    NOW()
) RETURNING id, email, username;

-- Clean up the test user
DELETE FROM public.users WHERE email = 'test-fix@example.com'; 